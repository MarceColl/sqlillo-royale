import {wait} from '../utils';

import {Match, User} from './types';

// The API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

///////////////
// Mutations
///////////////

type LoginInput = {
  username: string; password: string
};
type LoginOutput = {
  token: string
};
export const login = async({
  username,
  password,
}: LoginInput): Promise<LoginOutput> => {
  const resp = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({username, password}),
  });

  const json = await resp.json();

  return {token: json.token};
};

type RegisterInput = {
  username: string; password: string
};
type RegisterOutput = {
  success: boolean
};
export const register = async({
  username,
  password,
}: RegisterInput): Promise<RegisterOutput> => {
  const resp = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      // NOTE(taras): XD
      password2: password
    }),
  });

  return {
    success: resp.status === 200,
  };
};

type SaveCodeInput = {
  value: string
};
type SaveCodeOutput = {
  success: boolean
};
export const saveCode = async({
  value: code,
}: SaveCodeInput): Promise<SaveCodeOutput> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: 'POST',
    body: JSON.stringify({code}),
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return {
    success: resp.status === 200,
  };
};

///////////////
// Queries
///////////////

type GetLastCodeOutput = {
  id: string; code: string;
};
export const getLastCode = async(): Promise<GetLastCodeOutput|null> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: 'GET',
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem('token')}`,
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
export const getAllCodes = async(): Promise<GetAllCodesOutput> => {
  const resp = await fetch(`${API_URL}/api/private/codes`, {
    method: 'GET',
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return {
    codes: await resp.json()
  }
};

type GetMatchListOutput = {
  matchList: Match[]
};
export const getMatchList = async(): Promise<GetMatchListOutput> => {
  const resp = await fetch(`${API_URL}/api/private/games`, {
    method: 'GET',
    headers: {
      // NOTE(taras)
      // Maybe getting from local storage is not the best idea
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const games = await resp.json();

  return {
    matchList: games.map(({id}: {id: string}) => {
      return {
        id, name: id,
      }
    }),
  };
};

type GetRankingOutput = {
  ranking: User[]
};
export const getRanking = async(): Promise<GetRankingOutput> => {
  // TODO
  console.log('[API] get ranking');
  await wait(500);
  return {
    ranking: [
      {id: 'user-1', username: 'User 1'},
      {id: 'user-2', username: 'User 2'},
      {id: 'user-3', username: 'User 3'},
    ],
  };
};

type GetMatchInput = {
  id: string
};
type GetMatchOutput = {
  match: Match
};
export const getMatch = async({
  id,
}: GetMatchInput): Promise<GetMatchOutput> => {
  // TODO
  console.log('[API] get match', id);
  await wait(500);
  return {
    match: {id, name: `Match ${id}`},
  };
};
