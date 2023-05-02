#pragma once

#include <stdint.h>
#include <stdbool.h>
#include <mmz/libs/vec.h>
#include <pthread.h>
#include "yyjson.h"

#define MAX_ENTITIES 5000

typedef enum {
    FREE,
    RUNNING,
    FINISHED,
    ERROR
} match_thread_status;

enum entity_type {
    PLAYER = 0,
    SMALL_PROJ = 1,
    LARGE_PROJ = 2,
    HEALTH_PICKUP = 3,
    SMALL_OBSTACLE = 4,
    LARGE_OBSTACLE = 5,
};

#define NUM_SKILLS 4

typedef struct {
  int id;
  float cd[NUM_SKILLS];
  int8_t health;
  int8_t used_skill;
  vecf_t skill_dir;
  bool stunned;
} player_t;

typedef struct {
  enum entity_type type;
  int owner;
} entity_metadata_t;

typedef struct {
  /* Entities */
  int n_players;
  player_t *players;

  vecf_t pos[MAX_ENTITIES];
  vecf_t dir[MAX_ENTITIES];
  entity_metadata_t meta[MAX_ENTITIES];

  int active_entities;

  /* Map */
  float w, h;

  vecf_t dc_center;
  float dc_radius;
  bool dc_active;

  /* Handle threads */
  pthread_t *threads;

  /* For traces json generation */
  yyjson_mut_doc *traces;
  yyjson_mut_val *traces_arr;
} gamestate_t;

typedef struct {
    int id;
    gamestate_t *gs;
    int curr_tick;
    int skipped_ticks;
    bool skip;
    bool done;
    bool dead;
} player_thread_data_t;

enum trace_type {
    ENTITY_CREATE = 0,
    ENTITY_DESTROY = 1,
    STATE_UPDATE = 2,
};

typedef struct {
    char *name;
    vecf_t pos;
    enum entity_type type;
} entity_create_trace_t;

typedef struct {
    vecf_t pos;
    int health;
    bool stunned;
    bool dead;
} entity_update_trace_t;

typedef struct {
    int entity_id;
    enum trace_type type;
    union {
        entity_create_trace_t create;
        entity_update_trace_t update;
    } trace_data;
} trace_t;

typedef enum movement_type {
  MT_ANGLE,      // Move in an angle, only valid for the current tick
  MT_TARGETED,   // Move relative to a target
  MT_COORD,      // Move towards a coordinate
} movement_type_t;
