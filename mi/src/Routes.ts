export type PathParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : never;
export type Path = (typeof Routes)[keyof typeof Routes];

const Routes = {
  login: "/login",
};

const build = <T extends Path>(route: T, p?: PathParams<T>) => {
  if (!p) return route;
  return Object.entries(p).reduce(
    (acc, [k, v]) => acc.replace(`:${k}`, v),
    route as string
  );
};

export { Routes, build };
