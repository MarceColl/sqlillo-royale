#include "ast.h"
#include <stdio.h>
#include <stdlib.h>

void ast_node_append_child(ast_node_t *obj, ast_node_t *node) {
    if (node == NULL) return; /* just ignored */
    if (node->parent != NULL) {
        if (node->sibling.prev != NULL) {
            node->sibling.prev->sibling.next = node->sibling.next;
        }
        else {
            node->parent->child.first = node->sibling.next;
        }
        if (node->sibling.next != NULL) {
            node->sibling.next->sibling.prev = node->sibling.prev;
        }
        else {
            node->parent->child.last = node->sibling.prev;
        }
        node->parent->arity--;
    }
    node->parent = obj;
    if (obj->child.last != NULL) {
        obj->child.last->sibling.next = node;
        node->sibling.prev = obj->child.last;
        node->sibling.next = NULL;
        obj->child.last = node;
    }
    else {
        node->sibling.prev = NULL;
        node->sibling.next = NULL;
        obj->child.last = node;
        obj->child.first = node;
    }
    obj->arity++;
}

void ast_node_prepend_child(ast_node_t *obj, ast_node_t *node) {
    if (node == NULL) return; /* just ignored */
    if (node->parent != NULL) {
        if (node->sibling.prev != NULL) {
            node->sibling.prev->sibling.next = node->sibling.next;
        }
        else {
            node->parent->child.first = node->sibling.next;
        }
        if (node->sibling.next != NULL) {
            node->sibling.next->sibling.prev = node->sibling.prev;
        }
        else {
            node->parent->child.last = node->sibling.prev;
        }
        node->parent->arity--;
    }
    node->parent = obj;
    if (obj->child.first != NULL) {
        obj->child.first->sibling.prev = node;
        node->sibling.next = obj->child.first;
        node->sibling.prev = NULL;
        obj->child.first = node;
    }
    else {
        node->sibling.next = NULL;
        node->sibling.prev = NULL;
        obj->child.first = node;
        obj->child.last = node;
    }
    obj->arity++;
}


static ast_node_t *create_ast_node(parser_state_t *p, ast_node_type_t type, range_t range) {
  ast_node_t *const node = (ast_node_t*)malloc(sizeof(ast_node_t));
  node->type = type;
  node->range = range;
  node->arity = 0;
  node->parent = NULL;
  node->sibling.prev = NULL;
  node->sibling.next = NULL;
  node->child.first = NULL;
  node->child.last = NULL;
  node->system = p;

  if (p->managed.last != NULL) {
    node->managed.prev = p->managed.last;
    node->managed.next = NULL;
    p->managed.last = node;

    if (node->managed.prev != NULL) {
      node->managed.prev->managed.next = node;
    } else {
      p->managed.first = node;
    }
  } else {
    node->managed.prev = NULL;
    node->managed.next = NULL;
    p->managed.first = node;
    p->managed.last = node;
  }
  return node;
}

ast_node_t *mmz_create_ast_node_terminal(parser_state_t *p, ast_node_type_t type, range_t range) {
  return create_ast_node(p, type, range);
}

ast_node_t *mmz_create_ast_node_unary(parser_state_t *p, ast_node_type_t type, range_t range, ast_node_t *node1) {
  if (node1 == NULL) {
    fprintf(stderr, "FATAL: Internal error\n");
  }

  ast_node_t *const node = create_ast_node(p, type, range);
  ast_node_append_child(node, node1);
  return node;
}

ast_node_t *mmz_create_ast_node_binary(parser_state_t *p, ast_node_type_t type, range_t range, ast_node_t *node1, ast_node_t *node2) {
  if (node1 == NULL) {
    fprintf(stderr, "FATAL: Internal error\n");
  }

  ast_node_t *const node = create_ast_node(p, type, range);
  ast_node_append_child(node, node1);
  ast_node_append_child(node, node2);
  return node;
}

ast_node_t *mmz_create_ast_node_variadic(parser_state_t *p, ast_node_type_t type, range_t range) {
  return create_ast_node(p, type, range);
}

static void dump_ast_(parser_state_t *obj, ast_node_t *node, int level) {
    const char *type = "UNKNOWN";
    switch (node->type) {
    case AST_NODE_TYPE_IDENTIFIER:          type = "IDENTIFIER";          break;
    case AST_NODE_TYPE_INTEGER_DEC:         type = "INTEGER_DEC";         break;
    case AST_NODE_TYPE_OPERATOR_ADD:        type = "OPERATOR_ADD";        break;
    case AST_NODE_TYPE_OPERATOR_SUB:        type = "OPERATOR_SUB";        break;
    case AST_NODE_TYPE_OPERATOR_MUL:        type = "OPERATOR_MUL";        break;
    case AST_NODE_TYPE_OPERATOR_DIV:        type = "OPERATOR_DIV";        break;
    case AST_NODE_TYPE_OPERATOR_ASSIGN:     type = "OPERATOR_ASSIGN";     break;
    case AST_NODE_TYPE_STATEMENT_LIST:      type = "STATEMENT_LIST";      break;
    default: break;
    }
    if (node->arity > 0 || node->type == AST_NODE_TYPE_STATEMENT_LIST) {
        printf("%*s%s: arity = %zu\n", 2 * level, "", type, node->arity);
        for (ast_node_t *p = node->child.first; p != NULL; p = p->sibling.next) {
            dump_ast_(obj, p, level + 1);
        }
    }
    else {
        /* printf( */
        /*     "%*s%s: value = '' %d, %d\n", */
        /*     2 * level, "", type, node->range.max, node->range.min */
        /* ); */
        printf(
            "%*s%s: value = '%.*s'\n",
            2 * level, "", type, (int)(node->range.max - node->range.min), obj->code + node->range.min
        );
    }
}

void mmz_dump_ast(parser_state_t *p, ast_node_t *root) {
    dump_ast_(p, root, 0);
}
