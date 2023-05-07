import { Path, PathParams, RoutesDefinition } from "./types";

export const build = <
  TRoutes extends RoutesDefinition,
  TPath extends Path<TRoutes>
>(
  route: TPath,
  p?: PathParams<TPath>
) => {
  if (!p) return route;
  return Object.entries(p).reduce(
    (acc, [k, v]) => acc.replace(`:${k}`, v),
    route as string
  );
};
