export type vec2 = [number, number];

export type Settings = {
  renderScaling: number;
};

export enum EntityKind {
  PLAYER = 0,
  BULLET = 1,
  OBSTACLE = 2,
}

export type BaseEntity = {
  id: number;
  pos: vec2;
  kind: EntityKind;
};

export type Player = BaseEntity & {
  kind: EntityKind.PLAYER;
  // 0 -> 100
  health: number;
};

export type Bullet = BaseEntity & {
  kind: EntityKind.BULLET;
};

export type Entity = Player | Bullet;

export type GameState = {
  entities: Entity[];
};

export type Map = {
  size: vec2;
};

export type Match = {
  map: Map;
  ticks: GameState[];
};

export type Interpolator = {
  getStateAtTick(tick: number): GameState;
};

// Raw traces defs

export type BaseTrace = {
  id: number;
  x: number;
  y: number;
  // tick
  t: number;
  // type
  ty: EntityKind;
};

export type PlayerTrace = BaseTrace & {
  h: number;
  ty: EntityKind.PLAYER;
};

export type BulletTrace = BaseTrace & {
  ty: EntityKind.BULLET;
};

export type Trace = PlayerTrace | BulletTrace;

export type RawMap = {
  // WEIGHT xdddddd
  weight: number;
  height: number;
};

export type RawMatch = {
  map: RawMap;
  traces: Trace[];
};
