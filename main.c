#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <dlfcn.h>
#include <sys/mman.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <pthread.h>
#include <time.h>
#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <libpq-fe.h>
#include <luajit.h>
#include <stdint.h>
#include <stdbool.h>
#include <math.h>

#define MMZ_GRAPHICS_SUPPORT 0

#if MMZ_GRAPHICS_SUPPORT
#include <SDL.h>
#endif


#define BASE_PLAYER_SPEED 60
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
    vecf_t pos;
    vecf_t dir;
    float cd[NUM_SKILLS];
    int8_t health;
    int8_t used_skill;
    bool stunned;
} player_t;

typedef struct {
    vecf_t pos;
    vecf_t dir;
    enum entity_type type;
    int owner;
} entity_t;

typedef struct {
    int n_players;
    player_t *players;
    entity_t *entities;
    pthread_t *threads;
} gamestate_t;

typedef struct {
    int id;
    gamestate_t *gs;
    int curr_tick;
    int skipped_ticks;
    bool skip;
    bool done;
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
} lua_entity_t;

static int entity_id(lua_State *L) {
  lua_entity_t *ent = (lua_entity_t*)lua_touserdata(L, 1);
  lua_pushinteger(L, ent->id);
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

static int me_move(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  me->p->dir.x = (float)luaL_checknumber(L, 2);
  me->p->dir.y = (float)luaL_checknumber(L, 3);
  return 0;
}

static int me_visible(lua_State *L) {
  me_t *me = (me_t*)lua_touserdata(L, 1);
  gamestate_t *gs = me->gs;

  lua_newtable(L);
  int idx = 1;
  for (int i = 0; i < gs->n_players; i++) {
    player_t *other = &gs->players[i];
    if ((me->p->id != other->id) && dist(&me->p->pos, &other->pos) < 50) {
      lua_entity_t *ent = lua_newuserdata(L, sizeof(lua_entity_t));
      luaL_getmetatable(L, "mimizu.entity");
      lua_setmetatable(L, -2);

      ent->id = other->id;
      ent->type = PLAYER;

      lua_rawseti(L, -2, idx++);
    }
  }

  return 1;
}

static const struct luaL_Reg melib_m[] = {
  {"health", me_health},
  {"move", me_move},
  {"id", me_id},
  {"visible", me_visible},
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

_Noreturn void *player_thread(void *data) {
  // From the Lua code you can access several stuff
  // * your health
    char *program = "\
a = 0\n\
pol = 1\n\
\n\
function bot_init (me)\n\
  if ((me:id() % 2) == 0) then\n\
    pol = -1\n\
  end\n\
end\n\
function bot_main (me)\n\
  if ((a % 100) < 25) then\n\
    me:move(pol * 1, 0)\n\
  elseif ((a % 100) < 50) then\n\
    me:move(0, pol * 1)\n\
  elseif ((a % 100) < 75) then\n\
    me:move(-1 * pol, 0)\n\
  else\n\
    me:move(0, -1 * pol)\n\
  end\n\
  a = a + 1\n\
  entities = me:visible()\n\
  for _, eid in ipairs(entities) do\n\
     print(eid)\n\
  end\n\
  for i=1,1000000 do end\n\
  if ((a % 100) == 0) then\n\
    pol = pol * -1\n\
  end\n\
end\n";
    player_thread_data_t *ptd = (player_thread_data_t *) data;
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);
    luaopen_melib(L);
    luaopen_entitylib(L);

    if (luaL_loadstring(L, program) || lua_pcall(L, 0, 0, 0)) {
      printf("cannot run file: %s", lua_tostring(L, -1));
    }

    int id = ptd->id;
    gamestate_t *gs = ptd->gs;
    player_t *this_player = &gs->players[id];

    int error = luaL_loadstring(L, program);

    call_bot_init(L, this_player, gs);

    while (true) {
        while (ptd->curr_tick == tick) {
            pthread_cond_wait(&inc_tick_cond_var, &inc_tick_cond_mut);
        }

        call_bot_main(L, this_player, gs);

        pthread_mutex_lock(&done_cond_mut);
        ptd->done = true;
        pthread_cond_broadcast(&done_cond_var);
        pthread_mutex_unlock(&done_cond_mut);

        ptd->curr_tick += 1;
    }
}

void normalize(vecf_t *v) {
  if (v->x == 0 && v->y == 0) {
    return;
  }

  float len = sqrtf(v->x * v->x + v->y * v->y);
  v->x /= len;
  v->y /= len;
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

    gamestate_t gs = {.n_players = 200, .players = (player_t *) malloc(
            sizeof(player_t) * 200), .threads = (pthread_t *) malloc(sizeof(pthread_t) * 200)};
    player_thread_data_t *ptd = (player_thread_data_t *) malloc(sizeof(player_thread_data_t) * 200);

    printf("Setup players structures\n");
    for (int i = 0; i < gs.n_players; i++) {
        gs.players[i] = (player_t) {.id = i, .health = 100, .used_skill = -1, .stunned = 0, .pos = {.x = rand_lim(
                500), .y = rand_lim(400)}};
        ptd[i] = (player_thread_data_t) {.id = i, .gs = &gs, .done = false, .curr_tick = -1};
        pthread_create(&gs.threads[i], NULL, &player_thread, &ptd[i]);
    }

    float curr_time = 0;
    printf("Starting match...\n");

    while (curr_time <= GAME_LENGTH) {
        bool done = false;
        while (!done) {
            pthread_cond_wait(&done_cond_var, &done_cond_mut);
            done = true;
            for (int i = 0; i < gs.n_players; i++) {
                done = done && ptd[i].done;
            }
        }
        for (int i = 0; i < gs.n_players; i++) {
            ptd[i].done = false;
        }

        for (int i = 0; i < gs.n_players; i++) {
            normalize(&gs.players[i].dir);
            gs.players[i].pos.x += gs.players[i].dir.x * TICK_TIME * BASE_PLAYER_SPEED;
            gs.players[i].pos.y += gs.players[i].dir.y * TICK_TIME * BASE_PLAYER_SPEED;
        }

        curr_time += TICK_TIME;

#if MMZ_GRAPHICS_SUPPORT
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, SDL_ALPHA_OPAQUE);
        SDL_RenderClear(renderer);

        SDL_SetRenderDrawColor(renderer, 255, 255, 255, SDL_ALPHA_OPAQUE);

        for (int i = 0; i < gs.n_players; i++) {
          SDL_RenderDrawPoint(renderer, gs.players[i].pos.x, gs.players[i].pos.y);
        }

        SDL_RenderPresent(renderer);
#endif

        pthread_mutex_lock(&inc_tick_cond_mut);
        tick += 1;
        pthread_cond_broadcast(&inc_tick_cond_var);
        pthread_mutex_unlock(&inc_tick_cond_mut);
    }

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

    /* while (true) { */
      run_match();
    /* } */
}
