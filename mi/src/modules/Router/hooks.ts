import { create } from "zustand";
import { PathParams } from "./types";
import { build } from "./utils";
import { useState } from "react";

type RouterStore = {
  path: string;
  setPath: (path: string) => void;
};

export const useRouterStore = create<RouterStore>()((set) => ({
  path: window.location.hash.slice(1),
  setPath: (path: string) => {
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
  const [state, setState] = useState<Record<string, unknown>>();
  return {
    goTo: <T extends string>(input: GoToInput<T>) => {
      if (typeof input === "string") {
        window.location.hash = `#${input}`;
        return;
      }
      const { path, params, state } = input;
      window.location.hash = `#${build(path, params)}`;
      setState(state);
    },
    state: <T extends Record<string, unknown>>() => state as T,
    path: useRouterStore((state) => state.path),
  };
};

export { useRouter };
