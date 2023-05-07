#include "test.h"
#include "lexer.c"

#define LEXER_TEST(name, code, ...) TEST(name) { token_type_t exp[] = { __VA_ARGS__ }; return _lexer_test(code, exp); }

MunitResult _lexer_test(char *code, token_type_t expected[]) {
  lexer *l = new_lexer(code);
  int i = 0;
  while (1) {
    assert(advance(l, expected[i]));
    if (expected[i] == TT_EOF) {
      break;
    }
    i += 1;
  }

  free(l);

  return MUNIT_OK;
}

LEXER_TEST(lex_number, "1", TT_NUMBER, TT_EOF);
LEXER_TEST(lex_multichar_number, "123", TT_NUMBER, TT_EOF);
LEXER_TEST(lex_var, "a", TT_NAME, TT_EOF);
LEXER_TEST(lex_multichar_var, "abc", TT_NAME, TT_EOF);
LEXER_TEST(lex_multichar_var_with_underscore, "a_b_c", TT_NAME, TT_EOF);
LEXER_TEST(lex_kitchen_sink_var, "A_b_12_C", TT_NAME, TT_EOF);
LEXER_TEST(lex_add, "+", TT_ADD, TT_EOF);
LEXER_TEST(lex_min, "-", TT_MINUS, TT_EOF);
LEXER_TEST(lex_mult, "*", TT_MULT, TT_EOF);
LEXER_TEST(lex_div, "/", TT_DIV, TT_EOF);
LEXER_TEST(lex_assign, "=", TT_ASSIGN, TT_EOF);
LEXER_TEST(lex_lparen, "(", TT_LPAREN, TT_EOF);
LEXER_TEST(lex_rparen, ")", TT_RPAREN, TT_EOF);
LEXER_TEST(lex_if, "if", TT_KW_IF, TT_EOF);
LEXER_TEST(basic_expr_with_div, "2/4", TT_NUMBER, TT_DIV, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr_with_mult, "2*4", TT_NUMBER, TT_MULT, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr_with_add, "2+4", TT_NUMBER, TT_ADD, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr_with_sub, "2-4", TT_NUMBER, TT_MINUS, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr, "2+4*9", TT_NUMBER, TT_ADD, TT_NUMBER, TT_MULT, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr_with_whitespace, "2 + 4 * 9", TT_NUMBER, TT_ADD, TT_NUMBER, TT_MULT, TT_NUMBER, TT_EOF);
LEXER_TEST(basic_expr_with_var, "2+4*a", TT_NUMBER, TT_ADD, TT_NUMBER, TT_MULT, TT_NAME, TT_EOF);
LEXER_TEST(basic_expr_with_multichar_var, "2+4*var", TT_NUMBER, TT_ADD, TT_NUMBER, TT_MULT, TT_NAME, TT_EOF);
LEXER_TEST(basic_expr_with_multichar_num, "24*123+12", TT_NUMBER, TT_MULT, TT_NUMBER, TT_ADD, TT_NUMBER, TT_EOF);
LEXER_TEST(lex_assign_var, "a = 3", TT_NAME, TT_ASSIGN, TT_NUMBER, TT_EOF);


MunitTest lexer_tests[] = {
  MMZ_TEST(lex_number),
  MMZ_TEST(lex_multichar_number),
  MMZ_TEST(lex_var),
  MMZ_TEST(lex_multichar_var),
  MMZ_TEST(lex_multichar_var_with_underscore),
  MMZ_TEST(lex_kitchen_sink_var),
  MMZ_TEST(lex_add),
  MMZ_TEST(lex_min),
  MMZ_TEST(lex_mult),
  MMZ_TEST(lex_div),
  MMZ_TEST(lex_assign),
  MMZ_TEST(lex_lparen),
  MMZ_TEST(lex_rparen),
  MMZ_TEST(lex_if),
  MMZ_TEST(basic_expr_with_div),
  MMZ_TEST(basic_expr_with_mult),
  MMZ_TEST(basic_expr_with_add),
  MMZ_TEST(basic_expr_with_sub),
  MMZ_TEST(basic_expr),
  MMZ_TEST(basic_expr_with_whitespace),
  MMZ_TEST(basic_expr_with_var),
  MMZ_TEST(basic_expr_with_multichar_var),
  MMZ_TEST(basic_expr_with_multichar_num),
  MMZ_TEST(lex_assign_var),
  { NULL, NULL, NULL, NULL, MUNIT_TEST_OPTION_NONE, NULL },
};
