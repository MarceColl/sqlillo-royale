#include "test.h"
#include "parser.c"

TEST(parser_basic_expr) {
  parser_t p;
  ast_node_t *ast = parse(&p, "a = -57298*8+10*12 + fun(1 + b, 4, t); b = 12; c = 14; if (a) { 1 + 2; 3 + 4; }");
  printf("AST: %p\n", ast);
  print_ast(ast, 0);

  parser_destroy(&p);

  return MUNIT_OK;
}


MunitTest parser_tests[] = {
  MMZ_TEST(parser_basic_expr),
  { NULL, NULL, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
};
