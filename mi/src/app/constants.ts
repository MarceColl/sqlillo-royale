export const Routes = {
  home: "/",
  login: "/login",
  register: "/register",
  editor: "/editor",
  matchList: "/match-list",
  match: "/match/:id",
  ranking: "/ranking",
} as const;

export const Queries = {
  ranking: "ranking",
  matchList: "matchList",
  match: "match",
};
