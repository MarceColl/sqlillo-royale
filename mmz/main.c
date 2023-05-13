#include <fcntl.h>
#include <lauxlib.h>
#include <libpq-fe.h>
#include <lua.h>
#include <luajit.h>
#include <lualib.h>
#include <math.h>
#include <pthread.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include "yyjson.h"

#define MMZ_GRAPHICS_SUPPORT 0
#define SAVE_TRACES 1

#if MMZ_GRAPHICS_SUPPORT
#include <SDL.h>
#endif

#define MAX_ENTITIES 20000
#define BASE_PLAYER_SPEED 20
#define TICK_TIME 0.033f
#define GAME_LENGTH 60 * 2
#define MELEE_RANGE 2.f
#define MELEE_DAMAGE 20.f
#define MELEE_COOLDOWN 50

typedef enum { FREE, RUNNING, FINISHED, ERROR } match_thread_status;

enum entity_type {
  NONE = -1,
  PLAYER = 0,
  SMALL_PROJ = 1,
  LARGE_PROJ = 2,
  HEALTH_PICKUP = 3,
  SMALL_OBSTACLE = 4,
  LARGE_OBSTACLE = 5,
};

#define NUM_SKILLS 4

int tick = -1;
pthread_cond_t inc_tick_cond_var;
pthread_mutex_t inc_tick_cond_mut;
pthread_cond_t done_cond_var;
pthread_mutex_t done_cond_mut;

PGconn *conn;

typedef struct {
  int tick;
  int radius;
  int speed;
} cod_timing_t;

typedef struct {
  int tick;
  char *username;
} ranking_entry_t;

cod_timing_t cod_timings[] = {
    {.tick = 0, .radius = 500, .speed = 20},
    {.tick = 800, .radius = 150, .speed = 5},
    {.tick = 1200, .radius = 90, .speed = 3},
    {.tick = 1500, .radius = 40, .speed = 3},
    {.tick = 1700, .radius = 10, .speed = 2},
    {.tick = 1900, .radius = 0, .speed = 1},
    {.tick = -1, .radius = -1, .speed = -1},
};

typedef struct {
  float x;
  float y;
} vecf_t;

typedef struct {
  // NOTE(taras)
  // Check on how do use this instead
  // so that it's more memory efficient, but having
  // issues below on init.
  // char uuid[32];
  char *uuid;
  char *code;
} player_code_t;

typedef enum {
  MT_NONE,
  MT_VECTOR,
  MT_TARGET,
} movement_type_t;

typedef enum {
  MD_NONE,
  MD_FORWARD,
  MD_BACKWARDS,
  MD_LEFT,
  MD_RIGHT,
} movement_dir_t;

typedef struct {
  movement_type_t type;
  union {
    vecf_t vec;
    movement_dir_t direction;
  } data;
} player_movement_t;

typedef struct {
  int id;
  char *username;
  player_code_t code;
  float cd[NUM_SKILLS];
  int64_t health;
  int8_t used_skill;
  vecf_t skill_dir;
  int targeted_player;  // If -1 no target, else player entity id
  player_movement_t movement;
  bool stunned;
  bool dead;
  int rank;
} player_t;

typedef struct {
  enum entity_type type;
  int owner;
} entity_metadata_t;

typedef struct {
  float x;
  float y;
  float radius;
} cod_t;

typedef struct {
  /* Entities */
  int n_players;
  player_t *players;

  vecf_t pos[MAX_ENTITIES];
  vecf_t dir[MAX_ENTITIES];
  entity_metadata_t meta[MAX_ENTITIES];

  int active_entities;

  /* Map */
  float w, h;

  cod_t cod;

  vecf_t dc_center;
  float dc_radius;
  bool dc_active;

  /* Handle threads */
  pthread_t *threads;

  /* For traces json generation */
  yyjson_mut_doc *traces;
  yyjson_mut_val *traces_arr;
} gamestate_t;

typedef struct {
  int id;
  gamestate_t *gs;
  int curr_tick;
  int skipped_ticks;
  bool skip;
  bool done;
  bool dead;
} player_thread_data_t;

enum trace_type {
  ENTITY_CREATE = 0,
  ENTITY_DESTROY = 1,
  STATE_UPDATE = 2,
};

typedef struct {
  char *name;
  vecf_t pos;
  enum entity_type type;
} entity_create_trace_t;

typedef struct {
  vecf_t pos;
  int health;
  bool stunned;
  bool dead;
} entity_update_trace_t;

typedef struct {
  int entity_id;
  enum trace_type type;
  union {
    entity_create_trace_t create;
    entity_update_trace_t update;
  } trace_data;
} trace_t;

int rand_lim(int limit) {
  int divisor = RAND_MAX / (limit + 1);
  int retval;

  do {
    retval = rand() / divisor;
  } while (retval > limit);

  return retval;
}

float dist(const vecf_t *pos, const vecf_t *other) {
  float x = other->x - pos->x;
  float y = other->y - pos->y;

  if (x == 0 && y == 0) return 0.0f;
  return fabs(sqrtf(x * x + y * y));
}

typedef struct {
  player_t *p;
  gamestate_t *gs;
} me_t;

typedef struct {
  enum entity_type type;
  int id;
  gamestate_t *gs;
} lua_entity_t;

static int entity_id(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 1);
  lua_pushinteger(L, ent->id);
  return 1;
}

static int entity_pos(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 1);

  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = ent->gs->pos[ent->id].x;
  vec->y = ent->gs->pos[ent->id].y;

  return 1;
}

static int entity_type(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 1);

  switch (ent->gs->meta[ent->id].type) {
    case PLAYER:
      lua_pushstring(L, "player");
      break;
    case SMALL_PROJ:
      lua_pushstring(L, "small_proj");
      break;
    default:
      lua_pushstring(L, "unknown");
      break;
  }

  return 1;
}

static int entity_alive(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 1);

  int alive = 0;
  switch (ent->gs->meta[ent->id].type) {
    case PLAYER:
      alive = !ent->gs->players[ent->id].dead;
      break;
    default:
      break;
  }

  lua_pushboolean(L, alive);

  return 1;
}

int lua_entity_to_string(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 1);
  lua_pushfstring(L, "<Entity id=%d type=%d>", ent->id, ent->type);
  return 1;
}

static const struct luaL_Reg entitylib_m[] = {
    {"__tostring", lua_entity_to_string},
    {"id", entity_id},
    {"pos", entity_pos},
    {"type", entity_type},
    {"alive", entity_alive},
    {NULL, NULL}};

static const struct luaL_Reg entitylib_f[] = {{NULL, NULL}};

int luaopen_entitylib(lua_State *L) {
  luaL_newmetatable(L, "mimizu.entity");
  lua_pushstring(L, "__index");
  lua_pushvalue(L, -2);
  lua_settable(L, -3);

  luaL_openlib(L, NULL, entitylib_m, 0);
  luaL_openlib(L, "entity", entitylib_f, 0);
  return 1;
}

static int vec_new(lua_State *L) {
  float x = (float)luaL_checknumber(L, 1);
  float y = (float)luaL_checknumber(L, 2);
  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = x;
  vec->y = y;

  return 1;
}

static int vec_add(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);
  vecf_t *vec2 = (vecf_t *)lua_touserdata(L, 2);

  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  if (vec1 == NULL || vec2 == NULL) {
    vec->x = 0;
    vec->y = 0;

    return 1;
  }

  vec->x = vec1->x + vec2->x;
  vec->y = vec1->y + vec2->y;

  return 1;
}

static int vec_sub(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);
  vecf_t *vec2 = (vecf_t *)lua_touserdata(L, 2);

  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  if (vec1 == NULL || vec2 == NULL) {
    vec->x = 0;
    vec->y = 0;

    return 1;
  }

  vec->x = vec1->x - vec2->x;
  vec->y = vec1->y - vec2->y;

  return 1;
}

static int vec_distance(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);
  vecf_t *vec2 = (vecf_t *)lua_touserdata(L, 2);

  if (vec1 == NULL || vec2 == NULL) {
    lua_pushnumber(L, -1);
    return 1;
  }

  lua_pushnumber(L, dist(vec1, vec2));

  return 1;
}

static int vec_x(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);

  if (vec1 == NULL) {
    lua_pushnumber(L, 0);
    return 1;
  }

  lua_pushnumber(L, vec1->x);
  return 1;
}

static int vec_y(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);

  if (vec1 == NULL) {
    lua_pushnumber(L, 0);
    return 1;
  }

  lua_pushnumber(L, vec1->y);
  return 1;
}

static int vec_rot(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);
  float angle = (float)luaL_checknumber(L, 2);

  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  if (vec1 == NULL) {
    vec->x = 0;
    vec->y = 0;

    return 1;
  }

  vec->x = cos(angle) * vec1->x + sin(angle) * vec1->y;
  vec->y = sin(angle) * vec1->x + cos(angle) * vec1->y;

  return 1;
}

static int vec_neg(lua_State *L) {
  vecf_t *vec1 = (vecf_t *)lua_touserdata(L, 1);

  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  if (vec1 == NULL) {
    vec->x = 0;
    vec->y = 0;

    return 1;
  }

  vec->x = -1 * vec1->x;
  vec->y = -1 * vec1->y;

  return 1;
}

int vec_to_string(lua_State *L) {
  vecf_t *vec = (vecf_t *)lua_touserdata(L, 1);
  lua_pushfstring(L, "vec(%f, %f)", vec->x, vec->y);
  return 1;
}

#if MMZ_GRAPHICS_SUPPORT
void DrawCircle(SDL_Renderer *renderer, int32_t centreX, int32_t centreY,
                int32_t radius) {
  const int32_t diameter = (radius * 2);

  int32_t x = (radius - 1);
  int32_t y = 0;
  int32_t tx = 1;
  int32_t ty = 1;
  int32_t error = (tx - diameter);

  while (x >= y) {
    // Each of the following renders an octant of the circle
    SDL_RenderDrawPoint(renderer, centreX + x, centreY - y);
    SDL_RenderDrawPoint(renderer, centreX + x, centreY + y);
    SDL_RenderDrawPoint(renderer, centreX - x, centreY - y);
    SDL_RenderDrawPoint(renderer, centreX - x, centreY + y);
    SDL_RenderDrawPoint(renderer, centreX + y, centreY - x);
    SDL_RenderDrawPoint(renderer, centreX + y, centreY + x);
    SDL_RenderDrawPoint(renderer, centreX - y, centreY - x);
    SDL_RenderDrawPoint(renderer, centreX - y, centreY + x);

    if (error <= 0) {
      ++y;
      error += ty;
      ty += 2;
    }

    if (error > 0) {
      --x;
      tx += 2;
      error += (tx - diameter);
    }
  }
}
#endif

static const struct luaL_Reg veclib_m[] = {
    {"add", vec_add},
    {"sub", vec_sub},
    {"rot", vec_rot},
    {"x", vec_x},
    {"y", vec_y},
    {"neg", vec_neg},
    {"__tostring", vec_to_string},
    {NULL, NULL},
};

static const struct luaL_Reg veclib_f[] = {
    {"new", vec_new},
    {"distance", vec_distance},
    {NULL, NULL},
};

int luaopen_veclib(lua_State *L) {
  luaL_newmetatable(L, "mimizu.vec");
  lua_pushstring(L, "__index");
  lua_pushvalue(L, -2);
  lua_settable(L, -3);

  luaL_openlib(L, NULL, veclib_m, 0);
  luaL_openlib(L, "vec", veclib_f, 0);
  return 1;
}

static int me_health(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  lua_pushnumber(L, me->p->health);
  return 1;
}

static int me_id(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  lua_pushinteger(L, me->p->id);
  return 1;
}

static int me_username(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  lua_pushstring(L, me->p->username);
  return 1;
}

static int me_pos(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  vecf_t *vec = (vecf_t *)lua_newuserdata(L, sizeof(vecf_t));
  vec->x = me->gs->pos[me->p->id].x;
  vec->y = me->gs->pos[me->p->id].y;
  return 1;
}

static int me_move(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  if (me == NULL) {
    return 0;
  }
  if (me->p == NULL) {
    return 0;
  }
  int eid = me->p->id;
  vecf_t *dir = (vecf_t *)lua_touserdata(L, 2);
  if (dir == NULL) {
    return 0;
  }
  me->gs->dir[eid].x = dir->x;
  me->gs->dir[eid].y = dir->y;
  return 0;
}

static int me_visible(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  gamestate_t *gs = me->gs;

  lua_newtable(L);
  int idx = 1;
  for (int i = 0; i < gs->active_entities; i++) {
    vecf_t *other = &gs->pos[i];
    if ((me->p->id != i) && dist(&gs->pos[me->p->id], other) < 50) {
      if (gs->meta[i].type == PLAYER && gs->players[i].dead) continue;
      lua_entity_t *ent = lua_newuserdata(L, sizeof(lua_entity_t));
      luaL_getmetatable(L, "mimizu.entity");
      lua_setmetatable(L, -2);

      ent->id = i;
      ent->type = gs->meta[i].type;
      ent->gs = gs;

      lua_rawseti(L, -2, idx++);
    }
  }

  return 1;
}

static int me_target(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  lua_entity_t *ent = (lua_entity_t *)lua_touserdata(L, 2);

  if (ent->type == PLAYER) {
    printf("Player %d targeted player %d\n", me->p->id, ent->id);
    me->p->targeted_player = ent->id;
  } else {
    printf("Cannot target a non-player entity\n");
  }

  return 0;
}

static int me_cast(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  int skill = luaL_checkinteger(L, 2);
  vecf_t *dir = (vecf_t *)lua_touserdata(L, 3);

  if (me->p->cd[skill] <= 0) {
    me->p->used_skill = skill;
    me->p->skill_dir.x = dir->x;
    me->p->skill_dir.y = dir->y;
  }

  return 0;
}

static int me_cod(lua_State *L) {
  me_t *me = (me_t *)lua_touserdata(L, 1);
  cod_t *cod = (cod_t *)lua_newuserdata(L, sizeof(cod_t));
  luaL_getmetatable(L, "mimizu.cod");
  lua_setmetatable(L, -2);

  cod->x = me->gs->cod.x;
  cod->y = me->gs->cod.y;
  cod->radius = me->gs->cod.radius;

  return 1;
}

static const struct luaL_Reg melib_m[] = {
    {"health", me_health}, {"me_cod", me_cod},        {"move", me_move},
    {"id", me_id},         {"username", me_username}, {"visible", me_visible},
    {"cast", me_cast},     {"pos", me_pos},           {"target", me_target},
    {NULL, NULL}};

static const struct luaL_Reg melib_f[] = {{NULL, NULL}};

static int cod_x(lua_State *L) {
  cod_t *cod = (cod_t *)lua_touserdata(L, 1);
  lua_pushnumber(L, cod->x);
  return 1;
}

static int cod_y(lua_State *L) {
  cod_t *cod = (cod_t *)lua_touserdata(L, 1);
  lua_pushnumber(L, cod->y);
  return 1;
}

static int cod_radius(lua_State *L) {
  cod_t *cod = (cod_t *)lua_touserdata(L, 1);
  lua_pushnumber(L, cod->radius);
  return 1;
}

static const struct luaL_Reg codlib_m[] = {
    {"x", cod_x},
    {"y", cod_y},
    {"radius", cod_radius},
};

static const struct luaL_Reg codlib_f[] = {{NULL, NULL}};

int luaopen_codlib(lua_State *L) {
  luaL_newmetatable(L, "mimizu.cod");
  lua_pushstring(L, "__index");
  lua_pushvalue(L, -2);
  lua_settable(L, -3);

  luaL_openlib(L, NULL, codlib_m, 0);
  luaL_openlib(L, "cod", codlib_f, 0);
  return 1;
}

int luaopen_melib(lua_State *L) {
  luaL_newmetatable(L, "mimizu.me");
  lua_pushstring(L, "__index");
  lua_pushvalue(L, -2);
  lua_settable(L, -3);

  luaL_openlib(L, NULL, melib_m, 0);
  luaL_openlib(L, "melib", melib_f, 0);
  return 1;
}

void call_bot_fn(lua_State *L, player_t *p, gamestate_t *gs, char *fn) {
  lua_getglobal(L, fn);

  me_t *me = lua_newuserdata(L, sizeof(me_t));
  luaL_getmetatable(L, "mimizu.me");
  lua_setmetatable(L, -2);

  me->p = p;
  me->gs = gs;

  if (lua_pcall(L, 1, 0, 0)) {
    printf("[WARN] Player %d running function `%s`: %s\n", p->id, fn,
           lua_tostring(L, -1));
  }
}

void call_bot_main(lua_State *L, player_t *p, gamestate_t *gs) {
  call_bot_fn(L, p, gs, "bot_main");
}

void call_bot_init(lua_State *L, player_t *p, gamestate_t *gs) {
  call_bot_fn(L, p, gs, "bot_init");
}

void too_much_instr_hook(lua_State *L, lua_Debug *ar) {
  luaL_error(L, "TOO MUCH");
}

void *player_thread(void *data) {
  player_thread_data_t *ptd = (player_thread_data_t *)data;
  lua_State *L = luaL_newstate();
  luaL_openlibs(L);
  luaopen_melib(L);
  luaopen_entitylib(L);
  luaopen_veclib(L);
  luaopen_codlib(L);

  lua_sethook(L, too_much_instr_hook, LUA_MASKCOUNT, 150000);

  int id = ptd->id;
  gamestate_t *gs = ptd->gs;
  player_t *this_player = &gs->players[id];
  char *code = this_player->code.code;

  if (luaL_loadstring(L, code) || lua_pcall(L, 0, 0, 0)) {
    printf("[WARN] Player %d cannot run file: %s\n", id, lua_tostring(L, -1));
    ptd->dead = true;
    return NULL;
  }

  luaL_loadstring(L, code);
  call_bot_init(L, this_player, gs);

  printf("[INFO] Player #%d called `bot_init` OK!\n", id);

  while (true) {
    pthread_mutex_lock(&inc_tick_cond_mut);
    while (ptd->curr_tick == tick) {
      pthread_cond_wait(&inc_tick_cond_var, &inc_tick_cond_mut);
    }
    pthread_mutex_unlock(&inc_tick_cond_mut);

    if (ptd->dead) {
      break;
    }

    call_bot_main(L, this_player, gs);

    pthread_mutex_lock(&done_cond_mut);
    ptd->done = true;
    pthread_cond_broadcast(&done_cond_var);
    pthread_mutex_unlock(&done_cond_mut);

    ptd->curr_tick += 1;
  }

  printf("Player #%d is DEAD, exiting thread...\n", id);

  return NULL;
}

void normalize(vecf_t *v) {
  if (v->x == 0 && v->y == 0) {
    return;
  }

  float len = sqrtf(v->x * v->x + v->y * v->y);
  v->x /= len;
  v->y /= len;
}

void init_traces(gamestate_t *gs) {
  gs->traces = yyjson_mut_doc_new(NULL);
  yyjson_mut_val *root = yyjson_mut_obj(gs->traces);
  yyjson_mut_val *keymap = yyjson_mut_str(gs->traces, "map");
  yyjson_mut_val *map_obj = yyjson_mut_obj(gs->traces);

  yyjson_mut_val *key_weight = yyjson_mut_str(gs->traces, "weight");
  yyjson_mut_val *key_height = yyjson_mut_str(gs->traces, "height");
  yyjson_mut_val *key_duration = yyjson_mut_str(gs->traces, "duration");
  yyjson_mut_val *key_tick_time = yyjson_mut_str(gs->traces, "tick_time");
  yyjson_mut_val *key_n_players = yyjson_mut_str(gs->traces, "num_players");
  yyjson_mut_val *key_dc_active = yyjson_mut_str(gs->traces, "dc_active");

  yyjson_mut_val *num_weight = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_val *num_height = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_val *num_duration = yyjson_mut_int(gs->traces, GAME_LENGTH);
  yyjson_mut_val *num_tick_time =
      yyjson_mut_real(gs->traces, (double)TICK_TIME);
  yyjson_mut_val *num_n_players = yyjson_mut_int(gs->traces, gs->n_players);
  yyjson_mut_val *bool_dc_active = yyjson_mut_bool(gs->traces, gs->dc_active);

  yyjson_mut_obj_add(map_obj, key_weight, num_weight);
  yyjson_mut_obj_add(map_obj, key_height, num_height);
  yyjson_mut_obj_add(map_obj, key_duration, num_duration);
  yyjson_mut_obj_add(map_obj, key_tick_time, num_tick_time);
  yyjson_mut_obj_add(map_obj, key_n_players, num_n_players);
  yyjson_mut_obj_add(map_obj, key_dc_active, bool_dc_active);

  yyjson_mut_obj_add(root, keymap, map_obj);

  yyjson_mut_val *traces = yyjson_mut_arr(gs->traces);
  gs->traces_arr = traces;

  yyjson_mut_val *traces_key = yyjson_mut_str(gs->traces, "traces");
  yyjson_mut_obj_add(root, traces_key, traces);
  yyjson_mut_doc_set_root(gs->traces, root);
}

void update_traces(gamestate_t *gs) {
  for (int i = 0; i < gs->active_entities; i++) {
    yyjson_mut_val *key_id = yyjson_mut_str(gs->traces, "id");
    yyjson_mut_val *key_username = yyjson_mut_str(gs->traces, "username");
    yyjson_mut_val *key_x = yyjson_mut_str(gs->traces, "x");
    yyjson_mut_val *key_y = yyjson_mut_str(gs->traces, "y");
    yyjson_mut_val *key_tick = yyjson_mut_str(gs->traces, "t");
    yyjson_mut_val *key_health = yyjson_mut_str(gs->traces, "h");
    yyjson_mut_val *key_type = yyjson_mut_str(gs->traces, "ty");

    yyjson_mut_val *str_username = yyjson_mut_null(gs->traces);

    // Only set the username when it is a player
    if (gs->meta[i].type == PLAYER) {
      str_username = yyjson_mut_str(gs->traces, gs->players[i].username);
    }

    yyjson_mut_val *num_id = yyjson_mut_int(gs->traces, i);
    yyjson_mut_val *num_x = yyjson_mut_real(gs->traces, gs->pos[i].x);
    yyjson_mut_val *num_y = yyjson_mut_real(gs->traces, gs->pos[i].y);
    yyjson_mut_val *num_tick = yyjson_mut_int(gs->traces, tick);
    yyjson_mut_val *num_health =
        yyjson_mut_int(gs->traces, gs->players[i].health);
    yyjson_mut_val *num_type = yyjson_mut_int(gs->traces, gs->meta[i].type);

    yyjson_mut_val *item = yyjson_mut_obj(gs->traces);

    yyjson_mut_obj_add(item, key_id, num_id);
    yyjson_mut_obj_add(item, key_username, str_username);
    yyjson_mut_obj_add(item, key_x, num_x);
    yyjson_mut_obj_add(item, key_y, num_y);
    yyjson_mut_obj_add(item, key_tick, num_tick);
    yyjson_mut_obj_add(item, key_health, num_health);
    yyjson_mut_obj_add(item, key_type, num_type);

    yyjson_mut_arr_append(gs->traces_arr, item);
  }

  yyjson_mut_val *key_type = yyjson_mut_str(gs->traces, "ty");
  yyjson_mut_val *key_x = yyjson_mut_str(gs->traces, "x");
  yyjson_mut_val *key_y = yyjson_mut_str(gs->traces, "y");
  yyjson_mut_val *key_tick = yyjson_mut_str(gs->traces, "t");
  yyjson_mut_val *key_radius = yyjson_mut_str(gs->traces, "r");

  yyjson_mut_val *val_type = yyjson_mut_str(gs->traces, "cod");
  yyjson_mut_val *num_x = yyjson_mut_real(gs->traces, gs->cod.x);
  yyjson_mut_val *num_y = yyjson_mut_real(gs->traces, gs->cod.y);
  yyjson_mut_val *num_radius = yyjson_mut_int(gs->traces, gs->cod.radius);
  yyjson_mut_val *num_tick = yyjson_mut_int(gs->traces, tick);

  yyjson_mut_val *item = yyjson_mut_obj(gs->traces);

  yyjson_mut_obj_add(item, key_x, num_x);
  yyjson_mut_obj_add(item, key_y, num_y);
  yyjson_mut_obj_add(item, key_radius, num_radius);
  yyjson_mut_obj_add(item, key_tick, num_tick);
  yyjson_mut_obj_add(item, key_type, val_type);

  yyjson_mut_arr_append(gs->traces_arr, item);
}

void save_traces(gamestate_t *gs) {
  yyjson_write_err json_err;

  if (!yyjson_mut_write_file("files/traces.json", gs->traces, 0, NULL,
                             &json_err)) {
    printf("[ERROR] Could not save data to JSON: (%u) %s\n", json_err.code,
           json_err.msg);
  }
}

int create_entity(gamestate_t *gs, enum entity_type ty, vecf_t *pos,
                  vecf_t *dir, int owner) {
  gs->active_entities += 1;
  int eid = gs->active_entities;
  gs->pos[eid].x = pos->x;
  gs->pos[eid].y = pos->y;
  gs->dir[eid].x = dir->x;
  gs->dir[eid].y = dir->y;
  gs->meta[eid].type = ty;
  gs->meta[eid].owner = owner;
  return eid;
}

void delete_entity(gamestate_t *gs, int eid) {
  int last_eid = gs->active_entities;
  gs->active_entities -= 1;
  if (last_eid == eid) {
    return;
  }
  gs->pos[eid].x = gs->pos[last_eid].x;
  gs->pos[eid].y = gs->pos[last_eid].y;
  gs->dir[eid].x = gs->dir[last_eid].x;
  gs->dir[eid].y = gs->dir[last_eid].y;
  gs->meta[eid].type = gs->meta[last_eid].type;
  gs->meta[eid].owner = gs->meta[last_eid].owner;
}

/**
 * Finished the PG conn and exists with code
 */
void pg_error_exit(PGconn *conn, int code) {
  PQfinish(conn);
  exit(code);
}

void pg_result_error_handler(PGresult *res) {
  int status = PQresultStatus(res);
  if (status != PGRES_TUPLES_OK) {
    printf("[ERROR] (%d) %s\n", status, PQresultErrorMessage(res));
    PQclear(res);
    pg_error_exit(conn, 1);
  }
}

void pg_command_error_handler(PGresult *res) {
  int status = PQresultStatus(res);
  if (status != PGRES_COMMAND_OK) {
    printf("[ERROR] (%d) %s\n", status, PQresultErrorMessage(res));
    PQclear(res);
    pg_error_exit(conn, 1);
  }
}

void run_match(int num_files, char **files) {
  srand(time(NULL));

  pthread_mutex_init(&inc_tick_cond_mut, NULL);
  pthread_mutex_init(&done_cond_mut, NULL);
  pthread_cond_init(&inc_tick_cond_var, NULL);
  pthread_cond_init(&done_cond_var, NULL);
  printf("Initialized base condition vars\n");

  int rows, n_players;
  PGresult *res;
  if (!files) {
    res = PQexec(conn,
                 "SELECT\n\
    DISTINCT ON (u.username)\n\
    u.username, c.id, c.code\n\
    FROM\n\
    users AS u\n\
    JOIN\n\
    codes AS c ON u.username = c.username\n\
    WHERE\n\
    u.deleted_at IS NULL\n\
    AND c.code IS NOT NULL\n\
    AND c.code != ''\n\
    ORDER BY\n\
    u.username,\n\
    c.created_at DESC;");

    pg_result_error_handler(res);

    rows = PQntuples(res);

    if (rows == 0) {
      printf("No codes in DB\n");
      return;
    }

    n_players = rows;

    printf("Got %d codes from DB\n", rows);
  } else {
    n_players = num_files;
  }

  gamestate_t gs = {
      .n_players = n_players,
      .active_entities = n_players,
      .players = (player_t *)malloc(sizeof(player_t) * MAX_ENTITIES),
      .threads = (pthread_t *)malloc(sizeof(pthread_t) * n_players),
      .w = 500,
      .h = 500,
      .cod = {.x = -1, .y = -1, .radius = -1},
      .dc_active = false,
  };

#if MMZ_GRAPHICS_SUPPORT
  if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
    printf("Error initializing SDL: %s\n", SDL_GetError());
  }

  SDL_Window *screen =
      SDL_CreateWindow("SQLillo Royale", SDL_WINDOWPOS_UNDEFINED,
                       SDL_WINDOWPOS_UNDEFINED, gs.w, gs.h, 0);

  SDL_Renderer *renderer =
      SDL_CreateRenderer(screen, -1, SDL_RENDERER_PRESENTVSYNC);
  printf("Created SDL renderer\n");
#endif

  player_thread_data_t *ptd = (player_thread_data_t *)malloc(
      sizeof(player_thread_data_t) * gs.n_players);
  init_traces(&gs);

  printf("Setup thread data for %d\n", gs.n_players);

  for (int i = 0; i < MAX_ENTITIES; i++) {
    gs.pos[i] = (vecf_t){.x = rand_lim(gs.w), .y = rand_lim(gs.h)};
    gs.meta[i] = (entity_metadata_t){.owner = i, .type = NONE};

    if (i < gs.n_players) {
      gs.players[i] = (player_t){.id = i,
                                 .username = PQgetvalue(res, i, 0),
                                 .health = 100,
                                 // No skill used
                                 .used_skill = -1,
                                 // No default movement
                                 .movement = {.type = MT_NONE},
                                 // No target
                                 .targeted_player = -1,
                                 .dead = 0,
                                 // Not stunned
                                 .stunned = 0};

      if (files) {
        gs.players[i].code = (player_code_t){.uuid = "hola", .code = files[i]};
      } else {
        gs.players[i].code = (player_code_t){.uuid = PQgetvalue(res, i, 1),
                                             .code = PQgetvalue(res, i, 2)};
      }

      gs.meta[i].type = PLAYER;
      ptd[i] = (player_thread_data_t){
          .id = i, .gs = &gs, .done = false, .curr_tick = -1, .dead = false};

      pthread_create(&gs.threads[i], NULL, &player_thread, &ptd[i]);

      printf("Player #%d is %s\n", i, gs.players[i].username);
    }
  }

  printf("Setup %d players structures with %d max entities\n", gs.n_players,
         MAX_ENTITIES);

  float curr_time = 0;
  printf("Starting match...\n");

  vecf_t cod_center = {.x = 250, .y = 250};
  int current_cod = 0;
  int current_radius = cod_timings[current_cod].radius;
  int target_radius = cod_timings[current_cod].radius;
  int alive_players = gs.n_players;

  int current_ranking = 0;
  int current_ranking_tick = tick;

  while (alive_players > 1) {
    pthread_mutex_lock(&inc_tick_cond_mut);
    tick += 1;

    cod_timing_t *timing = &cod_timings[current_cod];
    cod_timing_t *next_timing = &cod_timings[current_cod + 1];
    if (tick > next_timing->tick) {
      if (next_timing->tick != -1) {
        current_cod += 1;
        timing = &cod_timings[current_cod];
        next_timing = &cod_timings[current_cod + 1];
      }
      gs.cod.x = cod_center.x;
      gs.cod.y = cod_center.y;
      target_radius = timing->radius;
      printf("NEW COD %d (%f, %f) %d\n", tick, cod_center.x, cod_center.y,
             timing->radius);
    }

    if (current_radius > target_radius) {
      current_radius -= timing->speed;

      if (current_radius < target_radius) {
        current_radius = target_radius;
      }
    }

    gs.cod.radius = current_radius;

    bool done = false;
    pthread_mutex_lock(&done_cond_mut);

    // Now that we have the done mutex locked
    // we can broadcast and unlock the tick mut.
    // This will unblock all the player
    // threads that were waiting for the next tick.
    pthread_cond_broadcast(&inc_tick_cond_var);
    pthread_mutex_unlock(&inc_tick_cond_mut);

    while (!done) {
      // Here we wait for the threads to send done conditions.

      // NOTE(taras)
      // I think here there could be a case that all the players
      // finish before we call on this wait, which would
      // yield into a new race cond (?)
      pthread_cond_wait(&done_cond_var, &done_cond_mut);
      done = true;
      for (int i = 0; i < gs.n_players; i++) {
        if (!ptd[i].dead) {
          done = done && ptd[i].done;
        }
      }
    }
    pthread_mutex_unlock(&done_cond_mut);

    for (int i = 0; i < gs.n_players; i++) {
      ptd[i].done = false;
    }

    for (int i = 0; i < gs.active_entities; i++) {
      normalize(&gs.dir[i]);
      if (gs.meta[i].type == PLAYER) {
        if (ptd[i].dead) {
          continue;
        }
        gs.pos[i].x += gs.dir[i].x * TICK_TIME * BASE_PLAYER_SPEED;
        gs.pos[i].y += gs.dir[i].y * TICK_TIME * BASE_PLAYER_SPEED;
        normalize(&gs.players[i].skill_dir);

        if (dist(&cod_center, &gs.pos[i]) >= current_radius) {
          gs.players[i].health -= 1;
        }

        switch (gs.players[i].used_skill) {
          case 0:  // SMALL PROJ
            create_entity(&gs, SMALL_PROJ, &gs.pos[i], &gs.players[i].skill_dir,
                          i);
            gs.players[i].cd[0] = 30;
            break;
          case 1:  // DASH
            gs.pos[i].x += gs.players[i].skill_dir.x * 10;
            gs.pos[i].y += gs.players[i].skill_dir.y * 10;
            gs.players[i].cd[1] = 260;
            break;
          case 2:  // MELEE
            for (int j = 0; j < gs.n_players; j++) {
              if (i == j) {
                continue;
              }
              if (dist(&gs.pos[i], &gs.pos[j]) > MELEE_RANGE) {
                continue;
              }
              gs.players[j].health -= MELEE_DAMAGE;
            }
            gs.players[i].cd[2] = MELEE_COOLDOWN;
            break;
        }
        gs.players[i].used_skill = -1;
        gs.players[i].cd[0] -= 1;
        gs.players[i].cd[1] -= 1;
        gs.players[i].cd[2] -= 1;

        for (int j = i + 1; j < gs.active_entities; j++) {
          if (dist(&gs.pos[i], &gs.pos[j]) < 1.f) {
            if (gs.meta[j].type == SMALL_PROJ && gs.meta[j].owner != i) {
              gs.players[i].health -= 10;
              delete_entity(&gs, j);
              j--;
            }
          }
        }

        if (gs.pos[i].x < 0) {
          gs.pos[i].x = 0;
        } else if (gs.pos[i].x > gs.w) {
          gs.pos[i].x = gs.w;
        }

        if (gs.pos[i].y < 0) {
          gs.pos[i].y = 0;
        } else if (gs.pos[i].y > gs.h) {
          gs.pos[i].y = gs.h;
        }

        if (gs.players[i].health <= 0 && !ptd[i].dead) {
          // delete_entity(&gs, i);
          if (current_ranking_tick != tick) {
            current_ranking_tick = tick;
            current_ranking += 1;
          }
          gs.players[i].rank = current_ranking;
          alive_players -= 1;
          ptd[i].dead = true;
          gs.players[i].dead = true;
        }
      } else if (gs.meta[i].type == SMALL_PROJ) {
        gs.pos[i].x += gs.dir[i].x * TICK_TIME * BASE_PLAYER_SPEED * 4;
        gs.pos[i].y += gs.dir[i].y * TICK_TIME * BASE_PLAYER_SPEED * 4;

        if (gs.pos[i].x < 0 || gs.pos[i].x > gs.w || gs.pos[i].y < 0 ||
            gs.pos[i].y > gs.h) {
          delete_entity(&gs, i);
        }
      }
    }

    update_traces(&gs);

    curr_time += TICK_TIME;

    alive_players = 0;
    for (int i = 0; i < gs.n_players; i++) {
      if (!ptd[i].dead) {
        alive_players += 1;
      }
    }

#if MMZ_GRAPHICS_SUPPORT
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, SDL_ALPHA_OPAQUE);
    SDL_RenderClear(renderer);

    SDL_SetRenderDrawColor(renderer, 162, 25, 255, SDL_ALPHA_OPAQUE);
    DrawCircle(renderer, cod_center.x, cod_center.y, current_radius);

    for (int i = 0; i < gs.active_entities; i++) {
      if (ptd[i].dead) continue;
      switch (gs.meta[i].type) {
        case PLAYER:
          SDL_SetRenderDrawColor(renderer, 255, 255, 255, SDL_ALPHA_OPAQUE);
          break;
        case SMALL_PROJ:
          SDL_SetRenderDrawColor(renderer, 255, 0, 0, SDL_ALPHA_OPAQUE);
          break;
        default:
          SDL_SetRenderDrawColor(renderer, 0, 255, 0, SDL_ALPHA_OPAQUE);
          break;
      }
      SDL_RenderDrawPoint(renderer, gs.pos[i].x, gs.pos[i].y);
    }

    SDL_RenderPresent(renderer);
#endif
  }

#if SAVE_TRACES
  save_traces(&gs);
  printf("Traces saved on disk!\n");
#endif

  const char *json = yyjson_mut_write(gs.traces, 0, NULL);
  yyjson_doc *doc = yyjson_read(json, strlen(json), 0);

  yyjson_mut_doc_free(gs.traces);

  if (!doc) {
    printf("[ERROR] Failed to parse JSON\n");
    exit(1);
  }

  yyjson_val *root = yyjson_doc_get_root(doc);

  yyjson_val *traces_val = yyjson_obj_get(root, "traces");
  const char *traces_str = yyjson_val_write(traces_val, 0, NULL);

  yyjson_val *config_val = yyjson_obj_get(root, "map");
  const char *config_str = yyjson_val_write(config_val, 0, NULL);

  const char *param_game[3] = {traces_str, config_str, "[]"};

  if (!files) {
    PGresult *res_ins =
        PQexecParams(conn,
                     "INSERT INTO games (id, data, config, outcome) VALUES "
                     "(uuid_generate_v4(), $1, $2, $3) RETURNING id",
                     3, NULL, param_game, NULL, NULL, 0);

    pg_result_error_handler(res_ins);
    int i_rows = PQntuples(res_ins);

    if (i_rows == 0) {
      printf("[ERROR] No game was generated...\n");
      pg_error_exit(conn, 1);
    } else if (i_rows > 1) {
      printf("[ERROR] More than one game generated (%d), WTF?\n", i_rows);
      pg_error_exit(conn, 1);
    }

    const char *game_uuid = PQgetvalue(res_ins, 0, 0);
    printf("Game id is %s\n", game_uuid);

    for (int i = 0; i < gs.n_players; i++) {
      pthread_cancel(gs.threads[i]);

      char rank_str[50];
      snprintf(rank_str, 50, "%d", gs.players[i].rank);
      const char *params_connection[4] = {gs.players[i].username, game_uuid,
                                          gs.players[i].code.uuid, rank_str};

      PGresult *res_ins_2 =
          PQexecParams(conn,
                       "INSERT INTO games_to_users (username, "
                       "game_id, code_id, rank) VALUES ($1, $2, $3, $4)",
                       4, NULL, params_connection, NULL, NULL, 0);

      pg_command_error_handler(res_ins_2);
      PQclear(res_ins_2);

      printf("Player #%d with %s connection created!\n", i,
             gs.players[i].username);
    }

    PQclear(res_ins);
    // NOTE(taras)
    // Close this now as we are using the `username` from it,
    // probably this could be done in a better way, but fuck it
    PQclear(res);
  }

  yyjson_doc_free(doc);
}

int main(int argc, char **argv) {
  printf("            _           _           \n");
  printf("  _ __ ___ (_)_ __ ___ (_)_____   _ \n");
  printf(" | '_ ` _ \\| | '_ ` _ \\| |_  / | | |\n");
  printf(" | | | | | | | | | | | | |/ /| |_| |\n");
  printf(" |_| |_| |_|_|_| |_| |_|_/___|\\__,_|\n");
  printf("                                    \n");

  char **files = NULL;
  if (argc > 1) {
    files = (char **)malloc(sizeof(char **) * (argc - 1));
    for (int i = 1; i < argc; i++) {
      FILE *fd = fopen(argv[i], "r");
      fseek(fd, 0, SEEK_END);
      size_t size = ftell(fd);
      fseek(fd, 0, SEEK_SET);
      char *buffer = (char *)malloc(size + 1);
      buffer[size] = '\0';
      fread(buffer, size, 1, fd);
      files[i - 1] = buffer;

      printf("File %s\n", files[i - 1]);
    }
  } else {
    conn =
        PQsetdbLogin("localhost", "5432", NULL, NULL, "sqlillo", "mmz", "mmz");

    if (PQstatus(conn) == CONNECTION_BAD) {
      printf("Connection to database failed: %s\n", PQerrorMessage(conn));

      PQfinish(conn);
      exit(1);
    }
  }

  printf("Start match...\n");

  /* while (true) { */
  run_match(argc - 1, files);
  /* } */

  printf("Exiting...\n");

  PQfinish(conn);
  return 0;
}
