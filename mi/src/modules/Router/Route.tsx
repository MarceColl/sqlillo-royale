import { useRouteMatch } from "./hooks";
import { PathParams } from "./types";

type Props<T extends string> = {
  children: React.ReactNode | ((vars: PathParams<T>) => React.ReactNode);
  path: T;
};

/**
 * A component that renders its children if the current path matches the given
 * path.
 *
 * The path can contain variables, which are prefixed with a colon. For example,
 * the path `/users/:id` will match `/users/1` and `/users/2`, but not
 * `/users` or `/users/1/2`.
 *
 * The variables are passed to the children as an object. For example, if the
 * path is `/users/:id` and the current path is `/users/1`, the children will
 * receive `{ id: "1" }`.
 *
 * @param children The children to render if the path matches.
 * @param path The path to match.
 * @returns The children if the path matches, or `null` otherwise.
 * @example
 * ```tsx
 * <Route path="/users/:id">
 *  {({ id }) => <UserPage id={id} />}
 * </Route>
 * ```
 */
const Route = <T extends string>({ children, path }: Props<T>) => {
  const { isMatch, params } = useRouteMatch(path);
  if (!isMatch) return null;

  return <>{typeof children === "function" ? children(params) : children}</>;
};

export { Route };
