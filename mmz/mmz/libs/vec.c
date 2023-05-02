#include "vec.h"

#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <math.h>
#include <stdlib.h>


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

static int vec_x(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);
  lua_pushnumber(L, vec1->x);
  return 1;
}

static int vec_y(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);
  lua_pushnumber(L, vec1->y);
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

static int vec_neg(lua_State *L) {
  vecf_t *vec1 = (vecf_t*)lua_touserdata(L, 1);

  vecf_t *vec = (vecf_t*)lua_newuserdata(L, sizeof(vecf_t));
  luaL_getmetatable(L, "mimizu.vec");
  lua_setmetatable(L, -2);

  vec->x = -1 * vec1->x;
  vec->y = -1 * vec1->y;

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
  {"x", vec_x},
  {"y", vec_y},
  {"neg", vec_neg},
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

float dist(const vecf_t *pos, const vecf_t *other) {
  float x = other->x - pos->x;
  float y = other->y - pos->y;

  if (x == 0 && y == 0) return 0.0f;
  return fabs(sqrtf(x*x + y*y));
}
