import { Routes } from "./Routes";
import { Route } from "./components";
import { LoginPage } from "./pages";

const Router = () => {
  return (
    <>
      <Route path={Routes.login}>
        <LoginPage />
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
    </>
  );
};

export default Router;
