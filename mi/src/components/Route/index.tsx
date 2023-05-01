import { PathParams } from "@/Routes";

type Props<T extends string> = {
  children: JSX.Element | ((vars: PathParams<T>) => JSX.Element);
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
  const parts = path.split("/");
  const variables = Object.fromEntries(
    parts
      .map((p, i) => [i, p] as const)
      .filter(([_, p]) => p.startsWith(":"))
      .map(([i, p]) => [i, p.slice(1)])
  );

  const matcher = parts
    .map((p, i) => (i in variables ? `(?<${variables[i]}>[^/]+)` : p))
    .join("/");

  const match = window.location.pathname.match(matcher);
  if (!match) return null;
  const values = match.groups as PathParams<T>;

  return typeof children === "function" ? children(values) : children;
};

export default Route;
