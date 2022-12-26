#ifndef AST_H_
#define AST_H_

#include <stddef.h>

typedef struct ast_node_tag ast_node_t;

typedef struct {
  size_t min;
  size_t max;
} range_t;

typedef enum ast_node_type_tag {
  AST_NODE_TYPE_IDENTIFIER,
  AST_NODE_TYPE_INTEGER_DEC,
  AST_NODE_TYPE_OPERATOR_ADD,
  AST_NODE_TYPE_OPERATOR_SUB,
  AST_NODE_TYPE_OPERATOR_MUL,
  AST_NODE_TYPE_OPERATOR_DIV,
  AST_NODE_TYPE_OPERATOR_POS,
  AST_NODE_TYPE_OPERATOR_NEG,
  AST_NODE_TYPE_OPERATOR_ASSIGN,
  AST_NODE_TYPE_STATEMENT_LIST,
} ast_node_type_t;

typedef struct {
  char *code;

  struct {
    ast_node_t *first;
    ast_node_t *last;
  } managed;
} parser_state_t;

struct ast_node_tag {
  ast_node_type_t type;
  range_t range;
  size_t arity;
  struct {
    ast_node_t *prev;
    ast_node_t *next;
  } sibling;
  struct {
    ast_node_t *first;
    ast_node_t *last;
  } child;
  ast_node_t *parent;
  struct {
    ast_node_t *prev;
    ast_node_t *next;
  } managed;
  parser_state_t *system;
};

typedef enum syntax_error_tag {
  SYNTAX_ERROR_UNKNOWN,
} syntax_error_t;

inline static range_t range_new(size_t min, size_t max) {
  const range_t obj = { min, max };
  return obj;
}

void ast_node_append_child(ast_node_t *obj, ast_node_t *node);
void ast_node_prepend_child(ast_node_t *obj, ast_node_t *node);

ast_node_t *mmz_create_ast_node_terminal(parser_state_t *p, ast_node_type_t type, range_t range);
ast_node_t *mmz_create_ast_node_unary(parser_state_t *p, ast_node_type_t type, range_t range, ast_node_t *node1);
ast_node_t *mmz_create_ast_node_binary(parser_state_t *p, ast_node_type_t type, range_t range, ast_node_t *node1, ast_node_t *node2);
ast_node_t *mmz_create_ast_node_variadic(parser_state_t *p, ast_node_type_t type, range_t range);

void mmz_dump_ast(parser_state_t *p, ast_node_t *root);

#endif // AST_H_
