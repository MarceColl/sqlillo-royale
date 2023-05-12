import { create } from "zustand";
import { PathParams } from "./types";
import { build } from "./utils";
import { useCallback, useMemo } from "react";

const matchRoute = <T extends string>(
  current: string,
  routeToMatch: T
): RouteMatch<T> => {
  const parts = routeToMatch.split("/");
  const variables = Object.fromEntries(
    parts
      .map((p, i) => [i, p] as const)
      .filter(([_, p]) => p.startsWith(":"))
      .map(([i, p]) => [i, p.slice(1)])
  );

  const urlMatcher = parts
    .map((p, i) => (i in variables ? `(?<${variables[i]}>[^/]+)` : p))
    .join("\\/");
  const matcher = new RegExp(`^${urlMatcher}$`);

  const match = current.match(matcher);
  if (!match) return { isMatch: false, params: null };
  const values = match.groups as PathParams<T>;
  return {
    isMatch: true,
    params: values,
  };
};

type RouterStore = {
  path: string;
  setPath: (path: string) => void;
};

export const useRouterStore = create<RouterStore>()((set) => ({
  path: window.location.hash.slice(1),
  setPath: (path: string) => {
    if (window.location.hash !== `#${path}`) {
      window.location.hash = `#${path}`;
    }
    set({ path });
  },
}));

type GoToInput<T extends string> =
  | {
      path: T;
      params?: PathParams<T>;
      state?: Record<string, unknown>;
    }
  | string;

export const useRouter = () => {
  const { setPath, path } = useRouterStore();
  const goTo = useCallback(
    <T extends string>(input: GoToInput<T>) => {
      if (typeof input === "string") {
        setPath(input);
        return;
      }
      const { path, params } = input;
      setPath(build(path, params));
    },
    [setPath]
  );

  return useMemo(
    () => ({
      goTo,
      path,
    }),
    [goTo, path]
  );
};

type RouteMatch<T extends string> =
  | {
      isMatch: false;
      params: null;
    }
  | {
      isMatch: true;
      params: PathParams<T>;
    };

export const useRouteMatch = <T extends string>(path: T): RouteMatch<T> => {
  const { path: currentPathname } = useRouter();

  return useMemo(() => {
    return matchRoute(currentPathname, path);
  }, [currentPathname, path]);
};

export const useMatcher = <T extends string>(
  routes: T[]
): Record<T, RouteMatch<T>> => {
  const { path: currentPathname } = useRouter();

  return useMemo(() => {
    const matches = routes.map((template) => {
      return [template, matchRoute(currentPathname, template)];
    });
    return Object.fromEntries(matches);
  }, [currentPathname, routes]);
};
