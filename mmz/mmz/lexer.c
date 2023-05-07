#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdio.h>
#include "lexer.h"

const char* tt_repr[TT_COUNT] = {
  "<NONE>",
  "<NUMBER>",
  "+",
  "-",
  "*",
  "/",
  "<NAME>",
  "=",
  ";",
  "<CALL>",
  ")",
  "{",
  "}",
  ",",
  "<IF>",
  "<WHILE>",
  "<FOR>",
  "<EOF>"
};

typedef struct keyword_mapping {
  char *str;
  size_t len;
  token_type_t type;
} keyword_mapping_t;

const keyword_mapping_t kw_map[] = {
  { .str = "if", .len = 2, .type = TT_KW_IF },
  { .str = "while", .len = 2, .type = TT_KW_WHILE },
  { .str = "for", .len = 2, .type = TT_KW_FOR },
  { .str = NULL, .len = 0, .type = TT_NONE },
};

lexer* new_lexer(char *input) {
  lexer *l = (lexer*)malloc(sizeof(lexer));
  l->input = input;
  l->current = input;
  next_token(l);
  return l;
}

int is_whitespace(char c) {
  switch(c) {
  case ' ':
  case '\n':
  case '\r':
    return 1;
  default:
    return 0;
  }
}

void next_token(lexer *l) {
  l->token.type = TT_EOF;

  if (*l->current == '\0') {
    return;
  }

  while (is_whitespace(*l->current)) {
    l->current++;
  }

  if (isdigit(*l->current)) {
    int64_t num = 0;
    num += *l->current - '0';
    l->current++;
    while(isdigit(*l->current)) {
      num = num * 10 + *l->current - '0';
      l->current++;
    }
    l->token.type = TT_NUMBER;
    l->token.value.num = num;
  } else if (isalpha(*l->current)) {
    int i = 0;
    keyword_mapping_t *kw = kw_map;

    if (strlen(l->current) >= kw->len) {
	while (kw->str) {
	if (strncmp(l->current, kw->str, kw->len) == 0) {
	    l->token.type = kw->type;
	    l->current += kw->len;
	    break;
	}

	kw += 1;
	}
    }

    if (l->token.type == TT_EOF) {
	l->current++;
	while(isdigit(*l->current) || isalpha(*l->current) || *l->current == '_') {
	    l->current++;
	}
	l->token.type = TT_NAME;
    }
  } else if (';' == *l->current) {
    l->token.type = TT_SEMICOLON;
    l->current++;
  } else if (',' == *l->current) {
    l->token.type = TT_COMMA;
    l->current++;
  } else if ('(' == *l->current) {
    l->token.type = TT_LPAREN;
    l->current++;
  } else if (')' == *l->current) {
    l->token.type = TT_RPAREN;
    l->current++;
  } else if ('{' == *l->current) {
    l->token.type = TT_LCBRACKET;
    l->current++;
  } else if ('}' == *l->current) {
    l->token.type = TT_RCBRACKET;
    l->current++;
  } else if ('+' == *l->current) {
    l->token.type = TT_ADD;
    l->current++;
  } else if ('=' == *l->current) {
    l->token.type = TT_ASSIGN;
    l->current++;
  } else if ('-' == *l->current) {
    l->token.type = TT_MINUS;
    l->current++;
  } else if ('*' == *l->current) {
    l->token.type = TT_MULT;
    l->current++;
  } else if ('/' == *l->current) {
    l->token.type = TT_DIV;
    l->current++;
  }
}

/**
 * Advance the lexer with a guaranteed token type
 * if TT_NONE is passed, no token type validation is done.
 */
int advance(lexer *l, enum token_type type) {
  if (type != TT_NONE && l->token.type != type) {
    fprintf(stdout, "Expected %s got %s\n", tt_repr[type], tt_repr[l->token.type]);
    return 0;
  }

  next_token(l);

  return 1;
}
