#pragma once

#include <stdlib.h>

struct arena;

/**
 * Initialize an arena with given item_size and block_size.
 */
struct arena* arena_init(size_t item_size, size_t block_size);

/**
 * Alloc in the arena
 */
void* arena_alloc(struct arena *arena);

/**
 * Destroy the arena. This deallocates everything.
 */
void arena_destroy(struct arena **arena);
