import { Routes } from "./constants";
import { Router, Route, useRouter } from "@/modules/Router";
import {
  LoginPage,
  HomePage,
  MatchListPage,
  RegisterPage,
  EditorPage,
  RankingPage,
  MatchPage,
} from "@/app/pages";
import { useAuth } from "./hooks";

const AppRoutes = () => {
  const { goTo } = useRouter();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    goTo(Routes.login);
  }
  return (
    <Router>
      <Route path={Routes.home}>
        <HomePage />
      </Route>
      <Route path={Routes.login}>
        <LoginPage />
      </Route>
      <Route path={Routes.register}>
        <RegisterPage />
      </Route>
      <Route path={Routes.editor}>
        <EditorPage />
      </Route>
      <Route path={Routes.matchList}>
        <MatchListPage />
      </Route>
      <Route path={Routes.ranking}>
        <RankingPage />
      </Route>
      <Route path={Routes.match}>
        {({ id }) => <MatchPage matchId={id} />}
      </Route>
    </Router>
  );
};

export { AppRoutes };
