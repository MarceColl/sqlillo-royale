#pragma once

#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdio.h>

typedef enum token_type {
  TT_NONE, // Does not exist as a token, used for the advance function

  TT_NUMBER,
  TT_ADD,
  TT_MINUS,
  TT_MULT,
  TT_DIV,
  TT_NAME,
  TT_ASSIGN,
  TT_SEMICOLON,
  TT_LPAREN,
  TT_RPAREN,
  TT_LCBRACKET,
  TT_RCBRACKET,
  TT_COMMA,

  // Keywords
  TT_KW_IF,
  TT_KW_WHILE,
  TT_KW_FOR,
  
  TT_EOF,

  // Leave at the end
  TT_COUNT
} token_type_t;

const char* tt_repr[TT_COUNT];

typedef struct Token {
  token_type_t type;
  union {
    char* str;
    int64_t num;
  } value;
} token_t;

typedef struct lexer {
  char *input;
  char *current;
  token_t token;
} lexer;

lexer* new_lexer(char *input);

int is_whitespace(char c);

void next_token(lexer *l);

/**
 * Advance the lexer with a guaranteed token type
 * if TT_NONE is passed, no token type validation is done.
 */
int advance(lexer *l, enum token_type type);
