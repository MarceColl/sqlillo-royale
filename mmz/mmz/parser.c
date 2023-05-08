#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <ctype.h>
#include <string.h>
#include <stdint.h>

#include "arena.h"
#include "parser.h"

#define INFIX(id, bp) symbol(parser, id, bp)->led = &infix_led;
#define INFIXR(id, bp) symbol(parser, id, bp)->led = &infixr_led;
#define PREFIX(id, bp) symbol(parser, id, bp)->nud = &prefix_nud;
#define LITERAL(id, bp) symbol(parser, id, bp)->nud = &literal_nud;
#define SYMBOL(id, bp) symbol(parser, id, bp)
#define DELIMITER(id) symbol(parser, id, 0)->nud = NULL; symbol(parser, id, 0)->led = NULL;

void print_ast(ast_node_t *root, int depth);
token_def_t* symbol(parser_t *parser, enum token_type id, uint64_t bp);
ast_node_t* default_nud(parser_t *parser, ast_node_t *this);
ast_node_t* default_led(parser_t *parser, ast_node_t *this, ast_node_t *left);
ast_node_t* infix_led(parser_t *parser, ast_node_t *this, ast_node_t *left);
ast_node_t* infixr_led(parser_t *parser, ast_node_t *this, ast_node_t *left);
ast_node_t* prefix_nud(parser_t *parser, ast_node_t *this);
ast_node_t *literal_nud(parser_t *parser, ast_node_t *this);
ast_node_t *lparen_group_nud(parser_t *parser, ast_node_t *this);
ast_node_t *lparen_call_led(parser_t *parser, ast_node_t *this, ast_node_t *left);
ast_node_t *if_fud(parser_t *parser, ast_node_t *this);
ast_node_t *while_fud(parser_t *parser, ast_node_t *this);

ast_node_t* ast_node_from_token(parser_t *parser, token_t *token) {
  if (token->type == TT_EOF) {
    return NULL;
  }
  ast_node_t *new_node = (ast_node_t*)arena_alloc(parser->ast_arena);
  memcpy(&new_node->token, token, sizeof(token_t));
  new_node->left = NULL;
  new_node->right = NULL;
  new_node->next = NULL;
  new_node->arity = 0;
  new_node->tdef = &parser->symbol_table[token->type];
  return new_node;
}

void parser_init(parser_t *parser, char* code) {
  parser->ast_arena = arena_init(sizeof(struct ast_node), 1024);
  parser->l = new_lexer(code);
  advance(parser->l, TT_NONE);

  for (int i = 0; i < TT_COUNT; i++) {
    parser->symbol_table[i].id = TT_NONE;
  }

  LITERAL(TT_NUMBER, 0);
  LITERAL(TT_NAME, 0);

  DELIMITER(TT_EOF);
  DELIMITER(TT_RCBRACKET);
  DELIMITER(TT_LCBRACKET);
  DELIMITER(TT_RPAREN);
  DELIMITER(TT_SEMICOLON);
  DELIMITER(TT_COMMA);

  // Grouping with parenthesis
  // SYMBOL(TT_LPAREN, 0)->nud = &lparen_group_nud;
  SYMBOL(TT_LPAREN, 90)->led = &lparen_call_led; // Call syntax

  SYMBOL(TT_KW_IF, 0)->fud = &if_fud;
  SYMBOL(TT_KW_WHILE, 0)->fud = &while_fud;
  SYMBOL(TT_KW_FOR, 0)->fud = &if_fud; // TODO(Marce): for fud

  INFIX(TT_ADD, 60);
  PREFIX(TT_ADD, 60);
  INFIX(TT_MINUS, 60);
  PREFIX(TT_MINUS, 60);
  INFIX(TT_MULT, 70);
  INFIX(TT_DIV, 70);

  INFIXR(TT_ASSIGN, 30);
}

void parser_destroy(parser_t *parser) {
  arena_destroy(&parser->ast_arena);
  free(parser->l);
}

ast_node_t* default_nud(parser_t *parser, ast_node_t *this) {
  this->tdef->error(this, "Undefined nud.");
  return NULL;
}

ast_node_t* literal_nud(parser_t *parser, ast_node_t *this) {
  return this;
}

ast_node_t* default_led(parser_t *parser, ast_node_t *this, ast_node_t *left) {
  this->tdef->error(this, "Missing operator.");
  return NULL;
}

void default_error(parser_t *parser, ast_node_t *this, char *msg) {
  fprintf(stderr, "Found error: %s\n", msg);
}

/**
 * Here is where the magic happens.
 * Pratt parsing beautiful expression function.
 * Like, how the fuck can you simplify so much
 */
ast_node_t* expression(parser_t *parser, int rbp) {
  ast_node_t *left = NULL;
  ast_node_t *tok = ast_node_from_token(parser, &parser->l->token);

  advance(parser->l, TT_NONE);
  left = tok->tdef->nud(parser, tok);

  ast_node_t *curr_tok = ast_node_from_token(parser, &parser->l->token);
  while (curr_tok && rbp < curr_tok->tdef->lbp) {
    tok = curr_tok;
    advance(parser->l, TT_NONE);
    left = tok->tdef->led(parser, tok, left);
    curr_tok = ast_node_from_token(parser, &parser->l->token);
  }

  return left;
}

ast_node_t *comma_separated_expressions(parser_t *parser) {
  ast_node_t *first = NULL;
  ast_node_t *last = NULL;
  token_def_t *curr_tok_def = &parser->symbol_table[parser->l->token.type];

  while (curr_tok_def->nud || curr_tok_def->led) {
    ast_node_t *new = expression(parser, 0);
    advance(parser->l, TT_COMMA);

    if (first == NULL) {
      first = new;
    }

    if (last != NULL) {
      last->next = new;
    }

    last = new;
    curr_tok_def = &parser->symbol_table[parser->l->token.type];
  }

  return first;
}

ast_node_t *statement(parser_t *parser) {
  ast_node_t *exp = NULL;
  token_def_t *curr_tok_def = &parser->symbol_table[parser->l->token.type];

  if (curr_tok_def->fud) {
    ast_node_t *tok = ast_node_from_token(parser, &parser->l->token);
    advance(parser->l, TT_NONE);
    return curr_tok_def->fud(parser, tok);
  }
  exp = expression(parser, 0);
  advance(parser->l, TT_SEMICOLON);
  return exp;
}

ast_node_t *statements(parser_t *parser) {
  ast_node_t *first = NULL;
  ast_node_t *last = NULL;
  token_def_t *curr_tok_def = &parser->symbol_table[parser->l->token.type];

  while (curr_tok_def->nud || curr_tok_def->fud) {
    ast_node_t *new = statement(parser);
    if (first == NULL) {
      first = new;
    }

    if (last != NULL) {
      last->next = new;
    }

    last = new;
    curr_tok_def = &parser->symbol_table[parser->l->token.type];
  }

  return first;
}

ast_node_t *block(parser_t *parser) {
  advance(parser->l, TT_LCBRACKET);
  ast_node_t *stmts = statements(parser);
  advance(parser->l, TT_RCBRACKET);
  return stmts;
}

void print_ast(ast_node_t *root, int depth) {
  if (!root) {
    return;
  }

  ast_node_t *next = root;
  while(next) {
    printf("%.*s %s", depth*2, "                     ", tt_repr[next->token.type]);
    if (next->token.type == TT_NUMBER) {
	printf(" %ld", next->token.value.num);
    }
    printf("\n");

    print_ast(next->left, depth+1);
    print_ast(next->right, depth+1);

    next = next->next;
  }
}

ast_node_t* infix_led(parser_t *parser, ast_node_t *this, ast_node_t *left) {
  this->left = left;
  this->right = expression(parser, this->tdef->lbp);
  this->arity = 2;
  return this;
}

ast_node_t* infixr_led(parser_t *parser, ast_node_t *this, ast_node_t *left) {
  this->left = left;
  this->right = expression(parser, this->tdef->lbp - 1);
  this->arity = 2;
  return this;
}

ast_node_t* prefix_nud(parser_t *parser, ast_node_t *this) {
  this->left = expression(parser, 80);
  this->arity = 1;
  return this;
}

ast_node_t *lparen_group_nud(parser_t *parser, ast_node_t *this) {
  ast_node_t *expr = expression(parser, 0);
  advance(parser->l, TT_RPAREN);
  return expr;
}

ast_node_t *lparen_call_led(parser_t *parser, ast_node_t *this, ast_node_t *left) {
  this->left = left;
  this->right = comma_separated_expressions(parser);
  advance(parser->l, TT_RPAREN);
  return this;
}

ast_node_t *if_fud(parser_t *parser, ast_node_t *this) {
  advance(parser->l, TT_LPAREN);
  this->left = expression(parser, 0);
  advance(parser->l, TT_RPAREN);
  this->right = block(parser);
  this->arity = 0;
  return this;
}

ast_node_t *while_fud(parser_t *parser, ast_node_t *this) {
  advance(parser->l, TT_LPAREN);
  this->left = expression(parser, 0);
  advance(parser->l, TT_RPAREN);
  this->right = block(parser);
  this->arity = 0;
  return this;
}

/**
 * Initialize or find a symbol in the symbol table
 */
token_def_t* symbol(parser_t *parser, enum token_type id, uint64_t bp) {
  token_def_t *s = &parser->symbol_table[id];
  if (s->id == TT_NONE) {
    s->id = id;
    s->lbp = bp;
    s->nud = &default_nud;
    s->led = &default_led;
    s->fud = NULL;
    s->error = &default_error;
  }
  return s;
}


ast_node_t *parse(parser_t *parser, char *source) {
  parser_init(parser, source);
  return statements(parser);
}
