#pragma once

#include <unistd.h>
#include <lua.h>
#include <math.h>
#include <stdlib.h>

typedef struct {
    float x;
    float y;
} vecf_t;

int luaopen_veclib(lua_State *L);

float dist(const vecf_t *pos, const vecf_t *other);
