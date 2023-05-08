#pragma once

#include "lexer.h"
#include <stdint.h>

typedef struct parser parser_t;
typedef struct token_def token_def_t;

typedef struct ast_node {
  token_t token;
  token_def_t *tdef;
  struct ast_node *left;
  struct ast_node *right;
  struct ast_node *next;
  uint16_t arity;
} ast_node_t;

/**
 * Default token definition according to pratt parsing
 */
typedef struct token_def {
  enum token_type id;
  ast_node_t* (*nud)(parser_t *parser, ast_node_t *this);
  ast_node_t* (*led)(parser_t *parser, ast_node_t *this, ast_node_t *left);
  ast_node_t* (*fud)(parser_t *parser, ast_node_t *this);
  void (*error)(ast_node_t *this, char *msg);
  int lbp;
} token_def_t;

typedef struct parser {
  struct arena* ast_arena;
  lexer *l;
  token_def_t symbol_table[TT_COUNT];
} parser_t;

void parser_init(parser_t *parser, char* code);
void parser_destroy(parser_t *parser);
void print_ast(ast_node_t *root, int depth);
ast_node_t *parse(parser_t *parser, char *source);
