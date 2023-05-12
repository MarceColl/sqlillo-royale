import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, Match } from "./types";

type State = {
  carouselle?: boolean;
  state: "paused" | "playing";
  tick: number;
  match: Match | null;
  rate: number;
  followingPlayer: number | null;
};

type Actions = {
  setTick: (tick: number) => void;
  getGameState: () => GameState | null;
  setMatch: (match: Match, carouselle?: boolean) => void;
  play: () => void;
  pause: () => void;
  advanceTicks: (amount: number) => void;
  rewindTicks: (amount: number) => void;

  followPlayer: (id: number | null) => void;
};

export type MatchStore = State & Actions;

export const useMatchStore = create<MatchStore>()(
  subscribeWithSelector((set, get) => ({
    followingPlayer: null,
    match: null,
    getGameState: () => {
      const { match, tick } = get();
      return match?.ticks[tick] ?? null;
    },
    state: "paused",
    tick: 0,
    rate: 1,
    setTick: (tick: number) => set({ tick }),
    play: () => set({ state: "playing" }),
    pause: () => set({ state: "paused" }),
    advanceTicks: (amount: number) =>
      set((state) => ({ tick: state.tick + amount })),
    rewindTicks: (amount: number) =>
      set((state) => ({ tick: Math.max(0, state.tick - amount) })),
    followPlayer: (id: number | null) => set({ followingPlayer: id }),
    setMatch: (match: Match, carouselle?: boolean) => set({ match, carouselle, state: 'playing' }),
  }))
);
