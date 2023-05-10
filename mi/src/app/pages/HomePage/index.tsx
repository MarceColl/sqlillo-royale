import { Routes } from "@/app/constants";
import { useAuth } from "@/app/hooks";
import { Link } from "@/modules/Router";
import { Main } from "@/app/ui";

import * as S from "./styled";

const HomePage = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
  };
  return (
    <Main>
      <S.Menu>
        <Link to={Routes.editor}>
          <S.Button>Code</S.Button>
        </Link>
        <Link to={Routes.matchList}>
          <S.Button>Matches</S.Button>
        </Link>
        <Link to={Routes.ranking}>
          <S.Button>Ranking</S.Button>
        </Link>
        <S.Button onClick={handleLogout}>Logout</S.Button>
      </S.Menu>
    </Main>
  );
};

export { HomePage };
