#include "arena.h"

#include <stdint.h>
#include <stdlib.h>

struct arena_block {
  size_t total_size;
  size_t used_size;
  struct arena_block *next;
  struct arena_block *prev;
  uint8_t *next_item;
  uint8_t data[];
};

struct arena {
  struct arena_block *current_block;
  size_t item_size;
  size_t block_size;
};

/**
 * Add a new block to the arena
 */
void arena_new_block(struct arena *arena) {
  size_t block_mem_size = sizeof(struct arena_block) + arena->item_size * arena->block_size;
  struct arena_block *new_block = (struct arena_block*)malloc(block_mem_size);
  struct arena_block *old_current = arena->current_block;
  new_block->total_size = arena->block_size;
  new_block->used_size = 0;
  new_block->next = NULL;
  new_block->prev = old_current;
  new_block->next_item = new_block->data;
  if (old_current) {
    old_current->next = new_block;
  }
  arena->current_block = new_block;
}

struct arena* arena_init(size_t item_size, size_t block_size) {
  struct arena *arena = (struct arena *)malloc(sizeof(struct arena));
  arena->item_size = item_size;
  arena->block_size = block_size;
  arena->current_block = NULL;
  arena_new_block(arena);
  return arena;
}

void* arena_alloc(struct arena *arena) {
  struct arena_block *curr_block = arena->current_block;

  void *alloc_addr = curr_block->next_item;
  curr_block->next_item += arena->item_size;
  curr_block->used_size += 1;

  if (curr_block->total_size == curr_block->used_size) {
    arena_new_block(arena);
  }

  return alloc_addr;
}

void arena_destroy(struct arena **arena) {
  struct arena_block *b = (*arena)->current_block;

  while (b != NULL) {
    struct arena_block *to_delete = b;
    b = to_delete->prev;
    free(to_delete);
  }

  free(*arena);
  *arena = NULL;
}
