import { wait } from "../utils";
import { Match, RawMatchInfo } from "./components/MatchPlayer/types";

import { User } from "./types";

// The API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

///////////////
// Mutations
///////////////

type LoginInput = {
  username: string;
  password: string;
};
type LoginOutput = {
  token: string;
};
export const login = async ({
  username,
  password,
}: LoginInput): Promise<LoginOutput> => {
  const resp = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const json = await resp.json();

  return { token: json.token };
};

type RegisterInput = {
  username: string;
  password: string;
};
type RegisterOutput = {
  success: boolean;
};
export const register = async ({
  username,
  password,
}: RegisterInput): Promise<RegisterOutput> => {
  const resp = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      // NOTE(taras): XD
      password2: password,
    }),
  });

  return {
    success: resp.status === 200,
  };
};

type SaveCodeInput = {
  value: string;
};
type SaveCodeOutput = {
  success: boolean;
};
export const saveCode = async ({
  value: code,
}: SaveCodeInput): Promise<SaveCodeOutput> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return {
    success: resp.status === 200,
  };
};

///////////////
// Queries
///////////////

type GetUserInfo = {
  username: string;
  ranking?: number;
};
export const getUserInfo = async () => {
  const resp = await fetch(`${API_URL}/api/private/user`, {
    method: "GET",
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return (await resp.json()) as GetUserInfo;
};

type GetLastCodeOutput = {
  id: string;
  code: string;
};
export const getLastCode = async (): Promise<GetLastCodeOutput | null> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: "GET",
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const codes = await resp.json();

  if (!codes.length) {
    return null;
  }

  return codes[codes.length - 1];
};

type GetAllCodesOutput = {
  codes: GetLastCodeOutput[];
};
export const getAllCodes = async (): Promise<GetAllCodesOutput> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: "GET",
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return {
    codes: await resp.json(),
  };
};

export const getCarouselle = async (): Promise<Match> => {
  const resp = await fetch(`${API_URL}/api/carouselle`, {
    method: "GET",
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return (await resp.json()) as Match;
};

type GetMatchListOutput = {
  matchList: Match[];
};
export const getMatchList = async (): Promise<GetMatchListOutput> => {
  const resp = await fetch(`${API_URL}/api/private/games`, {
    method: "GET",
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const games = await resp.json();

  return {
    matchList: games.map((game: any) => {
      return {
        ...game,
        name: `${new Date(game.created_at).toLocaleString()}`,
      };
    }),
  };
};

type GetRankingOutput = {
  ranking: {username: string; rank: number;}[];
};
export const getRanking = async(): Promise<GetRankingOutput> => {
  const resp = await fetch(`${API_URL}/api/ranking`, {
    method: 'GET',
  });

  const ranking = await resp.json();

  return {ranking: ranking as GetRankingOutput['ranking']};
};

type GetMatchInput = {
  id: string;
};
type GetMatchOutput = {
  match: RawMatchInfo;
};
export const getMatch = async ({
  id,
}: GetMatchInput): Promise<GetMatchOutput> => {
  const resp = await fetch(`${API_URL}/api/games/${id}`, {
    method: "GET",
  });

  const game = await resp.json();

  return {
    match: {
      id: game.id,
      name: `${new Date(game.created_at).toLocaleString()}`,
      map: game.config,
    },
  };
};

export const getMatchData = async ({ id }: GetMatchInput) => {
  const resp = await fetch(`${API_URL}/api/games-data/${id}`, {
    method: "GET",
  });

  return resp.json();
};
