#include "test.h"
#include "arena.c"

MunitResult destroy_frees_and_overwrites(const MunitParameter params[], void* user_data_or_fixture) {
  struct arena *a = arena_init(sizeof(int), 8);
  arena_destroy(&a);

  assert_ptr_equal(a, NULL);

  return MUNIT_OK;
}

MunitResult new_block_is_created(const MunitParameter params[], void* user_data_or_fixture) {
  struct arena *a = arena_init(sizeof(int), 8);

  assert_int(a->item_size, ==, sizeof(int));
  assert_int(a->block_size, ==, 8);
  assert_int(a->current_block->total_size, ==, 8);
  assert_int(a->current_block->used_size, ==, 0);
  assert_ptr_equal(a->current_block->next_item, &a->current_block->data);

  struct arena_block *b = a->current_block;
  int* prev_item = NULL;

  int first_block[8] = {0, 1, 2, 3, 4, 5, 6, 7};
  int second_block[4] = {8, 9, 10, 11};

  for (int i = 0; i < 7; i++) {
    int* item = (int*)arena_alloc(a);
    *item = i;

    assert_int(a->current_block->used_size, ==, i + 1);
    if (prev_item != NULL) {
      assert_ptr_not_equal(item, prev_item);
      assert_int(((void*)item - (void*)prev_item), ==, sizeof(int));
    }

    prev_item = item;
    assert_ptr_equal(a->current_block, b);
  }

  *(int*)arena_alloc(a) = 7;
  assert_ptr_not_equal(a->current_block, b);
  assert_ptr_equal(a->current_block->prev, b);
  assert_ptr_equal(a->current_block->prev->next, a->current_block);
  assert_int(a->current_block->total_size, ==, 8);
  assert_int(a->current_block->used_size, ==, 0);
  assert_ptr_equal(a->current_block->next_item, &a->current_block->data);
  b = a->current_block;

  prev_item = NULL;
  for (int i = 0; i < 4; i++) {
    int* item = (int*)arena_alloc(a);
    *item = i + 8;

    if (prev_item != NULL) {
      assert_ptr_not_equal(item, prev_item);
      assert_int(((void*)item - (void*)prev_item), ==, sizeof(int));
    }

    prev_item = item;
    assert_ptr_equal(a->current_block, b);
  }

  arena_destroy(&a);

  return MUNIT_OK;
}

MunitTest arena_tests[] = {
  MMZ_TEST(destroy_frees_and_overwrites),
  MMZ_TEST(new_block_is_created),
  { NULL, NULL, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
};
