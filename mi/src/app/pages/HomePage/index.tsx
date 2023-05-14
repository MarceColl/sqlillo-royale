import { useQuery } from "react-query";

import { Queries, Routes } from "@/app/constants";
import * as API from "@/app/API";
import { useAuth } from "@/app/hooks";
import { Link } from "@/modules/Router";
import { Main } from "@/app/ui";

import * as S from "./styled";

const HomePage = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
  };

  const { data } = useQuery([Queries.userInfo], API.getUserInfo);
  const username = data?.username || "...";
  const ranking = data?.ranking;

  return (
    <Main>
      <S.UserInfo>
        Hi, <S.Username>{username}</S.Username>
        {ranking && <S.Ranking $ranking={ranking}>#{ranking}</S.Ranking>}
      </S.UserInfo>
      <S.Menu>
        <Link to={Routes.editor}>
          <S.Button>Code</S.Button>
        </Link>
        <Link to={Routes.matchList}>
          <S.Button>Matches</S.Button>
        </Link>
        <Link to={Routes.tracePlayer}>
          <S.Button>Play trace file</S.Button>
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
