#include "traces.h"
#include "yyjson.h"

void init_traces(gamestate_t *gs) {
  gs->traces = yyjson_mut_doc_new(NULL);
  yyjson_mut_val *root = yyjson_mut_obj(gs->traces);
  yyjson_mut_val *keymap = yyjson_mut_str(gs->traces, "map");
  yyjson_mut_val *map_obj = yyjson_mut_obj(gs->traces);
  yyjson_mut_val *keyw = yyjson_mut_str(gs->traces, "w");
  yyjson_mut_val *keyh = yyjson_mut_str(gs->traces, "h");
  yyjson_mut_val *numw = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_val *numh = yyjson_mut_int(gs->traces, 500);
  yyjson_mut_obj_add(map_obj, keyw, numw);
  yyjson_mut_obj_add(map_obj, keyh, numh);
  yyjson_mut_obj_add(root, keymap, map_obj);

  yyjson_mut_val *traces = yyjson_mut_arr(gs->traces);
  gs->traces_arr = traces;
  yyjson_mut_val *traces_key = yyjson_mut_str(gs->traces, "traces");
  yyjson_mut_obj_add(root, traces_key, traces);
  yyjson_mut_doc_set_root(gs->traces, root);
}

void update_traces(gamestate_t *gs, int tick) {
    for (int i = 0; i < gs->active_entities; i++) {
      yyjson_mut_val *keyid = yyjson_mut_str(gs->traces, "id");
      yyjson_mut_val *keyx = yyjson_mut_str(gs->traces, "x");
      yyjson_mut_val *keyy = yyjson_mut_str(gs->traces, "y");
      yyjson_mut_val *keytick = yyjson_mut_str(gs->traces, "t");
      yyjson_mut_val *keyhealth = yyjson_mut_str(gs->traces, "h");
      yyjson_mut_val *keytype = yyjson_mut_str(gs->traces, "ty");
      yyjson_mut_val *item = yyjson_mut_obj(gs->traces);
      yyjson_mut_val *numid = yyjson_mut_int(gs->traces, i);
      yyjson_mut_val *numx = yyjson_mut_real(gs->traces, gs->pos[i].x);
      yyjson_mut_val *numy = yyjson_mut_real(gs->traces, gs->pos[i].y);
      yyjson_mut_val *numtick = yyjson_mut_int(gs->traces, tick);
      yyjson_mut_val *numhealth = yyjson_mut_int(gs->traces, gs->players[i].health);
      yyjson_mut_val *numtype = yyjson_mut_int(gs->traces, gs->meta[i].type);
      yyjson_mut_obj_add(item, keyid, numid);
      yyjson_mut_obj_add(item, keyx, numx);
      yyjson_mut_obj_add(item, keyy, numy);
      yyjson_mut_obj_add(item, keytick, numtick);
      yyjson_mut_obj_add(item, keyhealth, numhealth);
      yyjson_mut_obj_add(item, keytype, numtype);
      yyjson_mut_arr_append(gs->traces_arr, item);
    }
}

void save_traces(gamestate_t *gs) {
  yyjson_mut_write_file("traces.json", gs->traces, 0, NULL, NULL);
}
