import {
  BaseTrace,
  Bullet,
  COD,
  CODTrace,
  Entity,
  EntityKind,
  Match,
  Player,
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

function mapPlayerTrace({ h, us, killed_by, ...rest }: PlayerTrace) {
  return {
    ...mapBaseTrace(rest),
    health: h,
    usedSkill: us,
    killedBy: killed_by,
  };
}

function mapCodTrace({ r, ...rest }: CODTrace) {
  return {
    ...mapBaseTrace(rest),
    radius: r,
  };
}

const mapTraceToEntityState = (t: Trace) => {
  switch (t.ty) {
    case EntityKind.PLAYER:
      return mapPlayerTrace(t);
    case EntityKind.COD:
      return mapCodTrace(t);
    default:
      return mapBaseTrace(t);
  }
};

export function mapTracesToFrontend({ map, traces, name }: RawMatch): Match {
  const { height, weight } = map;
  const result: Match = {
    name,
    map: { size: [weight, height] },
    ticks: [],
    players: {},
  };
  for (const trace of traces) {
    const tick = result.ticks[trace.t] || {
      players: [],
      bullets: [],
      cod: null,
    };
    if (!result.ticks[trace.t]) {
      result.ticks[trace.t] = tick;
    }
    const mappedTrace = mapTraceToEntityState(trace) as Entity;
    if (trace.ty === EntityKind.PLAYER) {
      result.players![mappedTrace.id] = {
        id: mappedTrace.id,
        name: trace.username,
        color: [Math.random(), Math.random(), Math.random()],
      };
      tick.players.push(mappedTrace as Player);
    } else if (trace.ty === EntityKind.BULLET) {
      tick.bullets.push(mappedTrace as Bullet);
    } else if (trace.ty === EntityKind.COD) {
      tick.cod = mappedTrace as COD;
    }
  }
  return result;
}
