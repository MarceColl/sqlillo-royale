#include "entity.h"


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
