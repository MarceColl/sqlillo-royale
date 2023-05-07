import {
  BaseTrace,
  Entity,
  EntityKind,
  Match,
  PlayerTrace,
  RawMatch,
  Trace,
  vec2,
} from "./types";

function mapBaseTrace({ id, x, y, ty }: BaseTrace) {
  return {
    id,
    pos: [x, y] as vec2,
    kind: ty,
  };
}

function mapPlayerTrace({ h, ...rest }: PlayerTrace) {
  return {
    ...mapBaseTrace(rest),
    health: h,
  };
}

const mapTraceToEntityState = (t: Trace) => {
  switch (t.ty) {
    case EntityKind.PLAYER:
      return mapPlayerTrace(t);
    default:
      return mapBaseTrace(t);
  }
};

export function mapTracesToFrontend({ map, traces }: RawMatch): Match {
  const { h, w } = map;
  const result: Match = {
    map: { size: [w, h] },
    ticks: [],
  };
  for (const trace of traces) {
    const tick = result.ticks[trace.t];
    const mappedTrace = mapTraceToEntityState(trace) as Entity;
    if (tick) {
      tick.entities.push(mappedTrace);
    } else {
      result.ticks[trace.t] = { entities: [mappedTrace] };
    }
  }
  return result;
}
