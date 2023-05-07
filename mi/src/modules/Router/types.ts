export type PathParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : never;

export type RoutesDefinition = Record<string, string>;

export type Path<TRoutes extends RoutesDefinition> = TRoutes[keyof TRoutes];
