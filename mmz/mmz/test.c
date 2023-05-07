#define MUNIT_ENABLE_ASSERT_ALIASES
#include "munit/munit.h"

#include "arena.test.c"
#include "lexer.test.c"
#include "parser.test.c"

static MunitSuite suites[] = {
    {"/arena", arena_tests, NULL, 1, MUNIT_SUITE_OPTION_NONE},
    {"/lexer", lexer_tests, NULL, 1, MUNIT_SUITE_OPTION_NONE},
    {"/parser", parser_tests, NULL, 1, MUNIT_SUITE_OPTION_NONE},
    {NULL, NULL, NULL, 0, MUNIT_SUITE_OPTION_NONE},    
};

static const MunitSuite main_suite = {
  "/tests",
  NULL,
  suites,
  1,
  MUNIT_SUITE_OPTION_NONE
};

int main(int argc, const char* argv[]) {
  munit_suite_main(&main_suite, NULL, argc, argv);
}
