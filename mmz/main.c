#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <time.h>
#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <luajit.h>
#include <stdint.h>
#include <stdbool.h>
#include <math.h>
#include <yyjson.h>

#define MMZ_GRAPHICS_SUPPORT 0

#if MMZ_GRAPHICS_SUPPORT
#include <SDL.h>
#endif

#define MAX_ENTITIES 5000
#define BASE_PLAYER_SPEED 20
#define TICK_TIME 0.033f
#define GAME_LENGTH 60 * 2

typedef enum {
    FREE,
    RUNNING,
    FINISHED,
    ERROR
} match_thread_status;

enum entity_type {
    PLAYER = 0,
    SMALL_PROJ = 1,
    LARGE_PROJ = 2,
    HEALTH_PICKUP = 3,
    SMALL_OBSTACLE = 4,
    LARGE_OBSTACLE = 5,
};

#define NUM_SKILLS 4

int tick = 0;
pthread_cond_t inc_tick_cond_var;
pthread_mutex_t inc_tick_cond_mut;
pthread_cond_t done_cond_var;
pthread_mutex_t done_cond_mut;

typedef struct {
    float x;
    float y;
} vecf_t;

typedef struct {
  int id;
  float cd[NUM_SKILLS];
  int8_t health;
  int8_t used_skill;
  vecf_t skill_dir;
  bool stunned;
} player_t;

typedef struct {
  enum entity_type type;
  int owner;
} entity_metadata_t;

typedef struct {
  /* Entities */
  int n_players;
  player_t *players;

  vecf_t pos[MAX_ENTITIES];
  vecf_t dir[MAX_ENTITIES];
  entity_metadata_t meta[MAX_ENTITIES];

  int active_entities;

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
  return abs(sqrtf(x*x + y*y));
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
  lua_entity_t *ent = (lua_entity_t*)lua_touserdata(L, 1);
  lua_pushinteger(L, ent->id);
  return 1;
}

static int entity_pos(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t*)lua_touserdata(L, 1);

  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = ent->gs->pos[ent->id].x;
  vec->y = ent->gs->pos[ent->id].y;

  return 1;
}

int lua_entity_to_string(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t*)lua_touserdata(L, 1);
  lua_pushfstring(L, "<Entity id=%d type=%d>", ent->id, ent->type);
  return 1;
}

static const struct luaL_Reg entitylib_m[] = {
  {"__tostring", lua_entity_to_string},
  {"id", entity_id},
  {"pos", entity_pos},
  {NULL, NULL}
};

static const struct luaL_Reg entitylib_f[] = {
  {NULL, NULL}
};

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
  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = x;
  vec->y = y;

  return 1;
}

static int vec_add(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);
  vecf_t *vec2 = (vecf_t*)lua_touserdata(L, 2);

  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = vec1->x + vec2->x;
  vec->y = vec1->y + vec2->y;

  return 1;
}

static int vec_sub(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);
  vecf_t *vec2 = (vecf_t*)lua_touserdata(L, 2);

  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = vec1->x - vec2->x;
  vec->y = vec1->y - vec2->y;

  return 1;
}

static int vec_rot(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);
  float angle = (float)luaL_checknumber(L, 2);

  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = cos(angle) * vec1->x + sin(angle) * vec1->y;
  vec->y = sin(angle) * vec1->x + cos(angle) * vec1->y;

  return 1;
}

int vec_to_string(lua_State *L) {
  vecf_t *vec = (vecf_t*)lua_touserdata(L, 1);
  lua_pushfstring(L, "vec(%f, %f)", vec->x, vec->y);
  return 1;
}

static const struct luaL_Reg veclib_m[] = {
  {"add", vec_add},
  {"sub", vec_sub},
  {"rot", vec_rot},
  {"__tostring", vec_to_string},
  {NULL, NULL},
};

static const struct luaL_Reg veclib_f[] = {
  {"new", vec_new},
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
  me_t *me = (me_t*)lua_touserdata(L, 1);
  lua_pushnumber(L, me->p->health);
  return 1;
}

static int me_id(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  lua_pushinteger(L, me->p->id);
  return 1;
}

static int me_pos(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  vec->x = me->gs->pos[me->p->id].x;
  vec->y = me->gs->pos[me->p->id].y;
  return 1;
}

static int me_move(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  int eid = me->p->id;
  vecf_t *dir = (vecf_t*)lua_touserdata(L, 2);
  me->gs->dir[eid].x = dir->x;
  me->gs->dir[eid].y = dir->y;
  return 0;
}

static int me_visible(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  gamestate_t *gs = me->gs;

  lua_newtable(L);
  int idx = 1;
  for (int i = 0; i < gs->active_entities; i++) {
    vecf_t *other = &gs->pos[i];
    if ((me->p->id != i) && dist(&gs->pos[me->p->id], other) < 50) {
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

static int me_cast(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  int skill = luaL_checkinteger(L, 2);
  vecf_t *dir = (vecf_t*)lua_touserdata(L, 3);

  if (me->p->cd[skill] <= 0) {
    me->p->used_skill = skill;
    me->p->skill_dir.x = dir->x;
    me->p->skill_dir.y = dir->y;
    me->p->cd[skill] = 30;
  }

  return 0;
}

static const struct luaL_Reg melib_m[] = {
  {"health", me_health},
  {"move", me_move},
  {"id", me_id},
  {"visible", me_visible},
  {"cast", me_cast},
  {"pos", me_pos},
  {NULL, NULL}
};

static const struct luaL_Reg melib_f[] = {
  {NULL, NULL}
};

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
      printf("error running function `%s`: %s", fn, lua_tostring(L, -1));
    }
}

void call_bot_main(lua_State *L, player_t *p, gamestate_t *gs) {
  call_bot_fn(L, p, gs, "bot_main");
}

void call_bot_init(lua_State *L, player_t *p, gamestate_t *gs) {
  call_bot_fn(L, p, gs, "bot_init");
}

void *player_thread(void *data) {
  // From the Lua code you can access several stuff
  // * your health
    char *program = "\
a = 0\n\
dir = vec.new(1, 0)\n\
\n\
function bot_init (me)\n\
  math.randomseed(os.clock()*10000)\n\
end\n\
\n\
function bot_main (me)\n\
  dir = dir:add(vec.new(math.random(0, 10) - 5, math.random(0, 10) - 5))\n\
  me:move(dir)\n\
  a = a + 1\n\
  entities = me:visible()\n\
  for _, ent in ipairs(entities) do\n\
    me:cast(0, ent:pos():sub(me:pos()))\n\
  end\n\
end\n";
    player_thread_data_t *ptd = (player_thread_data_t *) data;
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);
    luaopen_melib(L);
    luaopen_entitylib(L);
    luaopen_veclib(L);

    if (luaL_loadstring(L, program) || lua_pcall(L, 0, 0, 0)) {
      printf("cannot run file: %s", lua_tostring(L, -1));
      return;
    }

    int id = ptd->id;
    gamestate_t *gs = ptd->gs;
    player_t *this_player = &gs->players[id];

    int error = luaL_loadstring(L, program);

    call_bot_init(L, this_player, gs);

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
    printf("DEAD PLAYER. EXITING THREAD...\n");
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
  yyjson_mut_val *keyw = yyjson_mut_str(gs->traces, "w");
  yyjson_mut_val *keyh = yyjson_mut_str(gs->traces, "h");
  yyjson_mut_val *numw = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_val *numh = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_obj_add(map_obj, keyw, numw);
  yyjson_mut_obj_add(map_obj, keyh, numh);
  yyjson_mut_obj_add(root, keymap, map_obj);

  yyjson_mut_val *traces = yyjson_mut_arr(gs->traces);
  gs->traces_arr = traces;
  yyjson_mut_val *traces_key = yyjson_mut_str(gs->traces, "traces");
  yyjson_mut_obj_add(root, traces_key, traces);
  yyjson_mut_doc_set_root(gs->traces, root);
}

void update_traces(gamestate_t *gs) {
    for (int i = 0; i < gs->active_entities; i++) {
      yyjson_mut_val *keyid = yyjson_mut_str(gs->traces, "id");
      yyjson_mut_val *keyx = yyjson_mut_str(gs->traces, "x");
      yyjson_mut_val *keyy = yyjson_mut_str(gs->traces, "y");
      yyjson_mut_val *keytick = yyjson_mut_str(gs->traces, "t");
      yyjson_mut_val *keyhealth = yyjson_mut_str(gs->traces, "h");
      yyjson_mut_val *keytype = yyjson_mut_str(gs->traces, "ty");
      yyjson_mut_val *item = yyjson_mut_obj(gs->traces);
      yyjson_mut_val *numid = yyjson_mut_int(gs->traces, i);
      yyjson_mut_val *numx = yyjson_mut_real(gs->traces, gs->pos[i].x);
      yyjson_mut_val *numy = yyjson_mut_real(gs->traces, gs->pos[i].y);
      yyjson_mut_val *numtick = yyjson_mut_int(gs->traces, tick);
      yyjson_mut_val *numhealth = yyjson_mut_int(gs->traces, gs->players[i].health);
      yyjson_mut_val *numtype = yyjson_mut_int(gs->traces, gs->meta[i].type);
      yyjson_mut_obj_add(item, keyid, numid);
      yyjson_mut_obj_add(item, keyx, numx);
      yyjson_mut_obj_add(item, keyy, numy);
      yyjson_mut_obj_add(item, keytick, numtick);
      yyjson_mut_obj_add(item, keyhealth, numhealth);
      yyjson_mut_obj_add(item, keytype, numtype);
      yyjson_mut_arr_append(gs->traces_arr, item);
    }
}

void save_traces(gamestate_t *gs) {
  yyjson_mut_write_file("traces.json", gs->traces, 0, NULL, NULL);
}

int create_entity(gamestate_t *gs, enum entity_type ty, vecf_t *pos, vecf_t *dir, int owner) {
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

void run_match() {
    srand(time(NULL));

    pthread_mutex_init(&inc_tick_cond_mut, NULL);
    pthread_mutex_init(&done_cond_mut, NULL);
    pthread_cond_init(&inc_tick_cond_var, NULL);
    pthread_cond_init(&done_cond_var, NULL);
    printf("Initialized base condition vars\n");

#if MMZ_GRAPHICS_SUPPORT
    if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
      printf("Error initializing SDL: %s\n", SDL_GetError());
    }

    SDL_Window *screen = SDL_CreateWindow(
          "SQLillo Royale",
          SDL_WINDOWPOS_UNDEFINED,
          SDL_WINDOWPOS_UNDEFINED,
          640, 480, 0);

    SDL_Renderer *renderer = SDL_CreateRenderer(screen, -1, SDL_RENDERER_PRESENTVSYNC);
    printf("Created SDL renderer\n");
#endif

    gamestate_t gs = {
      .n_players = 200,
      .active_entities = 199,
      .players = (player_t *) malloc(sizeof(player_t) * 200),
      .threads = (pthread_t *) malloc(sizeof(pthread_t) * 200)
    };

    player_thread_data_t *ptd = (player_thread_data_t *) malloc(sizeof(player_thread_data_t) * 200);
    init_traces(&gs);

    printf("Setup players structures\n");
    for (int i = 0; i < gs.n_players; i++) {
      gs.pos[i] = (vecf_t) {.x = rand_lim(500), .y = rand_lim(400)};
      gs.players[i] = (player_t) {.id = i, .health = 100, .used_skill = -1, .stunned = 0 };
      ptd[i] = (player_thread_data_t) {.id = i, .gs = &gs, .done = false, .curr_tick = -1, .dead = false };
      gs.meta[i] = (entity_metadata_t) {.owner = i, .type = PLAYER};
      pthread_create(&gs.threads[i], NULL, &player_thread, &ptd[i]);
    }

    float curr_time = 0;
    printf("Starting match...\n");

    while (curr_time <= GAME_LENGTH) {
        bool done = false;
        pthread_mutex_lock(&done_cond_mut);
        while (!done) {
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
              gs.pos[i].x += gs.dir[i].x * TICK_TIME * BASE_PLAYER_SPEED;
              gs.pos[i].y += gs.dir[i].y * TICK_TIME * BASE_PLAYER_SPEED;

              if (gs.players[i].used_skill == 0) {
                create_entity(&gs, SMALL_PROJ, &gs.pos[i], &gs.players[i].skill_dir, i);
                gs.players[i].used_skill = -1;
              }

              gs.players[i].cd[0] -= 1;

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
              } else if (gs.pos[i].x > 500) {
                gs.pos[i].x = 500;
              }

              if (gs.pos[i].y < 0) {
                gs.pos[i].y = 0;
              } else if (gs.pos[i].y > 500) {
                gs.pos[i].y = 500;
              }

              if (gs.players[i].health <= 0) {
                delete_entity(&gs, i);
                ptd[i].dead = true;
              }
            } else if (gs.meta[i].type == SMALL_PROJ) {
              gs.pos[i].x += gs.dir[i].x * TICK_TIME * BASE_PLAYER_SPEED * 4;
              gs.pos[i].y += gs.dir[i].y * TICK_TIME * BASE_PLAYER_SPEED * 4;

              if (gs.pos[i].x < 0 || gs.pos[i].x > 500 || gs.pos[i].y < 0 || gs.pos[i].y > 500) {
                delete_entity(&gs, i);
              }
            }
        }

        update_traces(&gs);

        curr_time += TICK_TIME;

#if MMZ_GRAPHICS_SUPPORT
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, SDL_ALPHA_OPAQUE);
        SDL_RenderClear(renderer);

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

        pthread_mutex_lock(&inc_tick_cond_mut);
        tick += 1;
        pthread_cond_broadcast(&inc_tick_cond_var);
        pthread_mutex_unlock(&inc_tick_cond_mut);
    }

    save_traces(&gs);

    for (int i = 0; i < gs.n_players; i++) {
        pthread_cancel(gs.threads[i]);
    }
}

int main(int argc, char **argv) {
    printf("            _           _           \n");
    printf("  _ __ ___ (_)_ __ ___ (_)_____   _ \n");
    printf(" | '_ ` _ \\| | '_ ` _ \\| |_  / | | |\n");
    printf(" | | | | | | | | | | | | |/ /| |_| |\n");
    printf(" |_| |_| |_|_|_| |_| |_|_/___|\\__,_|\n");
    printf("                                    \n");

    printf("START\n");

    /* while (true) { */
      run_match();
    /* } */
}
