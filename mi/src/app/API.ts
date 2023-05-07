import { wait } from "../utils";
import { Match, User } from "./types";

///////////////
// Mutations
///////////////

type LoginInput = { username: string; password: string };
type LoginOutput = { token: string };
export const login = async ({
  username,
  password,
}: LoginInput): Promise<LoginOutput> => {
  // TODO
  console.log("[API] login", username, password);
  await wait(500);
  return { token: `${username}-${password}` };
};

type RegisterInput = { username: string; password: string };
type RegisterOutput = { success: boolean };
export const register = async ({
  username,
  password,
}: RegisterInput): Promise<RegisterOutput> => {
  // TODO
  console.log("[API] register", username, password);
  await wait(500);
  return { success: true };
};

type SaveCodeInput = { value: string };
type SaveCodeOutput = { success: boolean };
export const saveCode = async ({
  value,
}: SaveCodeInput): Promise<SaveCodeOutput> => {
  // TODO
  console.log("[API] save code", value);
  await wait(500);
  return { success: true };
};

///////////////
// Queries
///////////////

type GetMatchListOutput = { matchList: Match[] };
export const getMatchList = async (): Promise<GetMatchListOutput> => {
  // TODO
  console.log("[API] get match list");
  await wait(500);
  return {
    matchList: [
      { id: "match-1", name: "Match 1" },
      { id: "match-2", name: "Match 2" },
      { id: "match-3", name: "Match 3" },
    ],
  };
};

type GetRankingOutput = { ranking: User[] };
export const getRanking = async (): Promise<GetRankingOutput> => {
  // TODO
  console.log("[API] get ranking");
  await wait(500);
  return {
    ranking: [
      { id: "user-1", username: "User 1" },
      { id: "user-2", username: "User 2" },
      { id: "user-3", username: "User 3" },
    ],
  };
};

type GetMatchInput = { id: string };
type GetMatchOutput = { match: Match };
export const getMatch = async ({
  id,
}: GetMatchInput): Promise<GetMatchOutput> => {
  // TODO
  console.log("[API] get match", id);
  await wait(500);
  return {
    match: { id, name: `Match ${id}` },
  };
};
