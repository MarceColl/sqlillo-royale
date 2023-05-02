#include "me.h"

#include <mmz/libs/entity.h>

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
