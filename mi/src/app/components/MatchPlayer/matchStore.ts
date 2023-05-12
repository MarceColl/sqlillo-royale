import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, Match } from "./types";

type State = {
  state: "paused" | "playing";
  tick: number;
  match: Match | null;
  rate: number;
  followingPlayer: number | null;
};

type Actions = {
  setTick: (tick: number) => void;
  getGameState: () => GameState | null;
  setMatch: (match: Match) => void;
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
    getPlayerInfo: (infoId: number) => {
      const { match, tick } = get();
      return match?.ticks[tick].players.find(({ id }) => id === infoId) ?? null;
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
    setMatch: (match: Match) => set({ match }),
  }))
);
