export type vec2 = [number, number];

export type Settings = {
  renderScaling: number;
};

export enum EntityKind {
  PLAYER = 0,
  BULLET = 1,
  OBSTACLE = 2,
  COD = "cod",
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

export type COD = BaseEntity & {
  kind: EntityKind.COD;
  radius: number;
};

export type Entity = Player | Bullet | COD;

export type GameState = {
  players: Player[];
  bullets: Bullet[];
  cod: COD | null;
};

export type Map = {
  size: vec2;
};

export type PlayerInfo = {
  name: string;
  id: number;
  color: [number, number, number];
};

export type MatchInfo = {
  map: Map;
  players: Record<number, PlayerInfo>;
};

export type Match = MatchInfo & {
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
  username: string;
};

export type BulletTrace = BaseTrace & {
  ty: EntityKind.BULLET;
};

export type CODTrace = BaseTrace & {
  ty: EntityKind.COD;
  r: number;
};

export type Trace = PlayerTrace | BulletTrace | CODTrace;

export type RawMap = { height: number; weight: number };

export type RawMatch = {
  map: RawMap;
  traces: Trace[];
};
