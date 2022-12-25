import { GameState, Match } from "../renderer/canvas/types";

function interpolate(
    lastState: GameState,
    nextState: GameState,
    amount: number
) {
    // TODO
    return lastState;
}

export function getStateAtTick(match: Match, tick: number) {
    const previousTick = Math.floor(tick);
    const amount = tick - previousTick;
    const nextTick = previousTick + 1;
    const lastTickState = match.ticks[previousTick];
    const nextTickState = match.ticks[nextTick];
    if (!nextTickState) {
        return lastTickState;
    }
    return interpolate(lastTickState, nextTickState, amount);
}
