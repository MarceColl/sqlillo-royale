#pragma once

#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <mmz/types.h>

typedef struct {
  enum entity_type type;
  int id;
  gamestate_t *gs;
} lua_entity_t;

int luaopen_entitylib(lua_State *L);
