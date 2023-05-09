import { create } from "zustand";
import { PathParams } from "./types";
import { build } from "./utils";
import { useCallback, useMemo } from "react";

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

const useRouter = () => {
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

export { useRouter };
