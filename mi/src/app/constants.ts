export const PublicRoutes = {
  index: "/",
  login: "/login",
  register: "/register",
} as const;
export const PrivateRoutes = {
  home: "/home",
  editor: "/editor",
  matchList: "/match-list",
  match: "/match/:id",
  ranking: "/ranking",
} as const;

export const Routes = {
  ...PublicRoutes,
  ...PrivateRoutes,
};

export const Queries = {
  userInfo: "userInfo",
  ranking: "ranking",
  matchList: "matchList",
  match: "match",
  matchData: "matchData",
  code: "code",
};
