#pragma once

#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <mmz/types.h>

typedef struct {
  player_t *p;
  gamestate_t *gs;
} me_t;

/**
 * Open the "me" library, which allows players to interact with their bot.
 */
int luaopen_melib(lua_State *L);
