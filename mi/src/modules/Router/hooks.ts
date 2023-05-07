import { create } from "zustand";
import { PathParams } from "./types";
import { build } from "./utils";

type RouterStore = {
  path: string;
  setPath: (path: string) => void;
};

export const useRouterStore = create<RouterStore>()((set) => ({
  path: window.location.pathname,
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
  const pushState = (...args: Parameters<typeof window.history.pushState>) => {
    // No idea what am I doing, but looks like it works
    window.dispatchEvent(new Event("popstate"));
    window.history.pushState(...args);
    window.dispatchEvent(new Event("popstate"));
  };
  return {
    goTo: <T extends string>(input: GoToInput<T>) => {
      if (typeof input === "string") {
        pushState({}, "", input);
        return;
      }
      const { path, params, state } = input;
      pushState(state, "", build(path, params));
    },
    state: <T extends Record<string, unknown>>() => window.history.state as T,
    path: useRouterStore((state) => state.path),
  };
};

export { useRouter };
