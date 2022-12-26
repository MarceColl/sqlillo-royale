#include <ctype.h>
#include <stdio.h>

/*
  Only has 8 types, int64, float, string, vec, list, dict, struct and tuple

  Objective:
  * Maximum amount of memory
  * Maximum amount of time per execution
  * Fast compiled python-like language
*/

#define MAX_NODES 5000

char *sample_code = "\n\
test = 12\n\
16 + test\n";

/*
 * LEXER
 */

typedef struct {
  float x;
  float y;
} vec;

typedef enum {
  T_NONE,
  T_EOF,
  T_ASSIGN,
  T_VECLIT,
  T_INTLIT,
  T_IDENT,
  T_PLUS,
} symbol;

typedef struct {
  char *ptr;
  int len;
} str_t;

typedef struct tok {
  symbol token;
  union {
    int lit_int;
    str_t ident;
  };
} tok_t;

typedef struct {
  char *code;
  tok_t tok;
  char *ptr;
  int line;
  int col;
} parser_state_t;

static int chrpos(char *s, char c) {
  char *ptr = s;
  int pos = 0;

  while (*ptr != '\0') {
    if (*ptr == c) {
      return pos;
    }
    ptr++;
    pos += 1;
  }

  return -1;
}

static char consume(parser_state_t *restrict ps) {
  char c = *ps->ptr;
  ps->ptr++;
  return c;
}

static void takeback(parser_state_t *restrict ps) {
  ps->ptr--;
}

static char lookahead(parser_state_t *restrict ps) {
  return *(ps->ptr);
}

static int scannumber(parser_state_t *restrict ps) {
  char c = consume(ps);
  int k, val = 0;
  while((k = chrpos("0123456789", c)) >= 0) {
    val = val * 10 + k;
    c = consume(ps);
    ps->col += 1;
  }
  takeback(ps);

  return val;
}

static str_t scanident(parser_state_t *restrict ps) {
  char *ptr = ps->ptr;
  char c = consume(ps);
  int len = 0;
  while(isalpha(c)) {
    len += 1;
    c = consume(ps);
    ps->col += 1;
  }
  takeback(ps);

  return (str_t) {
    .ptr = ptr,
    .len = len
  };
}

static int scan(parser_state_t *restrict ps) {
  char c = lookahead(ps);
  if (c == '+') {
    consume(ps);
    ps->tok.token = T_PLUS;
    ps->col += 1;
  } else if (c == '=') {
    consume(ps);
    ps->tok.token = T_ASSIGN;
    ps->col += 1;
  } else if (isdigit(c)) {
    ps->tok.token = T_INTLIT;
    ps->tok.lit_int = scannumber(ps);
  } else if (isalpha(c)) {
    ps->tok.token = T_IDENT;
    ps->tok.ident = scanident(ps);
  } else if (c == '\0') {
    consume(ps);
    ps->tok.token = T_EOF;
  } else if (c == '\n') {
    consume(ps);
    ps->line += 1;
    ps->col = 0;
  } else {
    consume(ps);
    ps->col += 1;
  }

  return 1;
}

int accept(parser_state_t *ps, symbol s) {
  if (ps->tok.token == s) {
    return 1;
  }

  return 0;
}

int expect(parser_state_t *ps, symbol s) {
  if (accept(ps, s)) {
    return 1;
  }

  printf("ERROR\n");
  return 0;
}

void ident(parser_state_t *ps) {
  if (accept(ps, T_PLUS)) {

  }
}

void parse(parser_state_t *ps) {
  if (accept(ps, T_IDENT)) {
    scan(ps);
    ident(ps);
  }
}

int main() {
  parser_state_t ps = {
    .code = sample_code,
    .ptr = sample_code,
    .line = 0,
    .col = 0,
  };

  do {
    scan(&ps);
  } while(ps.tok.token != T_EOF);
}
