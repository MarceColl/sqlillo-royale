import { vec2 } from "../../math/vec2";
import {
    BaseTrace,
    Bullet,
    Entity,
    EntityKind,
    Match,
    Player,
    PlayerTrace,
    RawMatch,
    Trace,
} from "./types";

export function isPlayer(e: Entity): e is Player {
    return e.kind === EntityKind.PLAYER;
}

export function isBullet(e: Entity): e is Bullet {
    return e.kind === EntityKind.BULLET;
}

// https://www.trysmudford.com/blog/linear-interpolation-functions/
export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
export const invlerp = (x: number, y: number, a: number) =>
    clamp((a - x) / (y - x));
export const clamp = (a: number, min = 0, max = 1) =>
    Math.min(max, Math.max(min, a));
export const range = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    a: number
) => lerp(x2, y2, invlerp(x1, y1, a));

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

export function posOutOfBounds(bounds: vec2, pos: vec2) {
    return pos[0] < 0 || pos[0] > bounds[0] || pos[1] < 0 || pos[1] > bounds[1];
}
