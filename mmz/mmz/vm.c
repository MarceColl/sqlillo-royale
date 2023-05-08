#include "parser.h"

typedef struct stack {
  
} stack_t;

typedef enum value_type {
  VT_NUMBER,
  VT_STRING,
  VT_VECTOR,
  VT_ARRAY,
  VT_OBJECT,
} value_type_t;

typedef struct value {
  value_type_t type;
  union {
    int64_t number;
    char *string;
    
  }
} value_t;

/**
 * Structure that holds the limits of the VM
 */
typedef struct vm_limits {
  size_t maxmem;
  size_t maxinstr;
} vm_limits_t;

/**
 * mmz VM
 */
typedef struct vm {
  ast_node_t *root;
  ast_node_t *curr;
  struct arena* ast_arena;
  vm_limits_t limits;
  stack_t stack;
} vm_t;

/**
 * Initialize the VM with the given source code.
 */
void vm_init(vm_t *vm, char *source, ) {
  parser_init(&parser);
  vm->root = parser_parse(&parser, source);
}

/**
 * Run a tick of the VM.
 * A tick ends when one of these two conditions happens:
 *   - The maxinstr limit is reached
 *   - The bot tick function ends
 *
 * The next time the function is called will continue from where
 * it left. If the function had ended, then it will call that
 * function again.
 */
void vm_tick(vm_t *vm) {
  
}

/**
 * Destroy the VM and free all associated data
 */
void vm_destroy(vm_t **vm) {
  // TODO(Marce)
}
