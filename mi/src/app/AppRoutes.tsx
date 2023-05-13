import { PrivateRoutes, PublicRoutes, Routes } from "./constants";
import { Router, Route, useRouter, useMatcher } from "@/modules/Router";
import {
  LoginPage,
  HomePage,
  MatchListPage,
  RegisterPage,
  EditorPage,
  RankingPage,
  MatchPage,
  TraceMatchPage,
  CarousellePage,
} from "@/app/pages";
import { useAuth } from "./hooks";
import { useEffect } from "react";
import { IndexPage } from "./pages/IndexPage";

const AppRoutes = () => {
  const { goTo } = useRouter();
  const { isAuthenticated } = useAuth();
  const privateMatchings = useMatcher(Object.values(PrivateRoutes));
  useEffect(() => {
    const isAccessingPrivate = Object.values(privateMatchings).some(
      ({ isMatch }) => isMatch
    );
    if (isAccessingPrivate) {
      if (!isAuthenticated) {
        goTo(Routes.login);
        return;
      }
    }
  }, [privateMatchings, isAuthenticated]);
  return (
    <Router>
      <Route path={Routes.carouselle}>
        <CarousellePage />
      </Route>
      <Route path={Routes.index}>
        <IndexPage />
      </Route>
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
      <Route path={Routes.tracePlayer}>
        <TraceMatchPage/>
      </Route>
    </Router>
  );
};

export { AppRoutes };
