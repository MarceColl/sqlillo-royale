#define MUNIT_ENABLE_ASSERT_ALIASES
#include "munit/munit.h"

#define TEST(name) static MunitResult name(const MunitParameter params[], void* user_data_or_fixture)
#define MMZ_TEST(name) { "/" #name, name, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL }
