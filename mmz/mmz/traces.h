#pragma once

#include <mmz/types.h>

void init_traces(gamestate_t *gs);
void update_traces(gamestate_t *gs, int tick);
void save_traces(gamestate_t *gs);
