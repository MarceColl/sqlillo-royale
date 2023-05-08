import { useEffect, useRef } from "react";
import { MatchStore, useMatchStore } from "./matchStore";

export const useCurrentTickRef = () => {
  const currentTickRef = useRef<number>(useMatchStore.getState().tick);
  useEffect(
    () =>
      useMatchStore.subscribe(
        (state: MatchStore) => state.tick,
        (tick) => {
          currentTickRef.current = tick;
        }
      ),
    []
  );
  return currentTickRef;
};
