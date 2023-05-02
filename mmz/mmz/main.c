#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <time.h>
#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <luajit.h>
#include <math.h>

#include <mmz/types.h>
#include <mmz/traces.h>
#include <mmz/libs/vec.h>
#include <mmz/libs/me.h>
#include <mmz/libs/entity.h>

#define MMZ_GRAPHICS_SUPPORT 0

#if MMZ_GRAPHICS_SUPPORT
#include <SDL.h>
#endif

#define BASE_PLAYER_SPEED 20
#define TICK_TIME 0.033f
#define GAME_LENGTH 60 * 2
#define MELEE_RANGE 2.f
#define MELEE_DAMAGE 20.f
#define MELEE_COOLDOWN 50

int tick = 0;

pthread_cond_t inc_tick_cond_var;
pthread_mutex_t inc_tick_cond_mut;
pthread_cond_t done_cond_var;
pthread_mutex_t done_cond_mut;

int rand_lim(int limit) {
    int divisor = RAND_MAX / (limit + 1);
    int retval;

    do {
        retval = rand() / divisor;
    } while (retval > limit);

    return retval;
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
my_pos = vec.new(0, 0)\n\
dir = vec.new(1, 0)\n\
\n\
function bot_init (me)\n\
  math.randomseed(os.clock()*10000)\n\
end\n\
\n\
function bot_main (me)\n\
  my_pos = me:pos()\n\
  dir = dir:add(vec.new(math.random(0, 10) - 5, math.random(0, 10) - 5))\n\
  me:move(dir)\n\
  a = a + 1\n\
  entities = me:visible()\n\
  for _, ent in ipairs(entities) do\n\
    me:cast(0, ent:pos():sub(my_pos))\n\
    me:cast(1, ent:pos():sub(my_pos))\n\
    me:cast(2, ent:pos():sub(my_pos))\n\
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
      return NULL;
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

    gamestate_t gs = {
      .n_players = 200,
      .active_entities = 199,
      .players = (player_t *) malloc(sizeof(player_t) * 200),
      .threads = (pthread_t *) malloc(sizeof(pthread_t) * 200),
      .w = 600,
      .h = 500,
      .dc_active = false,
    };

#if MMZ_GRAPHICS_SUPPORT
    if (SDL_Init(SDL_INIT_EVERYTHING) != 0) {
      printf("Error initializing SDL: %s\n", SDL_GetError());
    }

    SDL_Window *screen = SDL_CreateWindow(
          "SQLillo Royale",
          SDL_WINDOWPOS_UNDEFINED,
          SDL_WINDOWPOS_UNDEFINED,
          gs.w, gs.h, 0);

    SDL_Renderer *renderer = SDL_CreateRenderer(screen, -1, SDL_RENDERER_PRESENTVSYNC);
    printf("Created SDL renderer\n");
#endif

    player_thread_data_t *ptd = (player_thread_data_t *) malloc(sizeof(player_thread_data_t) * 200);
    init_traces(&gs);

    printf("Setup players structures\n");
    for (int i = 0; i < gs.n_players; i++) {
      gs.pos[i] = (vecf_t) {.x = rand_lim(gs.w), .y = rand_lim(gs.h)};
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
              normalize(&gs.players[i].skill_dir);

              switch (gs.players[i].used_skill) {
                case 0: // SMALL PROJ
                  create_entity(&gs, SMALL_PROJ, &gs.pos[i], &gs.players[i].skill_dir, i);
                  gs.players[i].cd[0] = 30;
                  break;
                case 1: // DASH
                  gs.pos[i].x += gs.players[i].skill_dir.x * 10;
                  gs.pos[i].y += gs.players[i].skill_dir.y * 10;
                  gs.players[i].cd[1] = 260;
                  break;
                case 2: // MELEE
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

              if (gs.players[i].health <= 0) {
                delete_entity(&gs, i);
                ptd[i].dead = true;
              }
            } else if (gs.meta[i].type == SMALL_PROJ) {
              gs.pos[i].x += gs.dir[i].x * TICK_TIME * BASE_PLAYER_SPEED * 4;
              gs.pos[i].y += gs.dir[i].y * TICK_TIME * BASE_PLAYER_SPEED * 4;

              if (gs.pos[i].x < 0 || gs.pos[i].x > gs.w || gs.pos[i].y < 0 || gs.pos[i].y > gs.h) {
                delete_entity(&gs, i);
              }
            }
        }

        update_traces(&gs, tick);

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
