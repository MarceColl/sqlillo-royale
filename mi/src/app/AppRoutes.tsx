import { Routes } from "./constants";
import { Router, Route, useRouter } from "@/modules/Router";
import { LoginPage, HomePage } from "@/app/pages";
import { useAuth } from "./hooks";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const { goTo } = useRouter();
  if (!isAuthenticated) {
    goTo(Routes.login);
  }
  return (
    <Router>
      <Route path={Routes.login}>
        <LoginPage />
      </Route>
      <Route path={Routes.home}>
        <HomePage />
      </Route>
      {/* <Route path="/register">
              <RegisterPage />
          </Route>
          <Route path="/matches">
              <MatchesPage />
          </Route>
          <Route path="/ranking">
              <RankingPage />
          </Route> */}
    </Router>
  );
};

export { AppRoutes };
