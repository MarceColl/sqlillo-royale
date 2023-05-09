import { useQuery } from "react-query";

import { Queries, Routes } from "@/app/constants";
import * as API from "@/app/API";
import * as S from "./styled";
import { Link } from "@/modules/Router";

const MatchListPage = () => {
  const { data, isLoading } = useQuery([Queries.matchList], API.getMatchList);
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { matchList } = data;

  return (
    <S.Container>
      <S.List>
        {matchList.map(({ id, name }) => {
          return (
            <S.Match key={id}>
              <Link to={Routes.match} params={{ id }}>
                {name}
              </Link>
            </S.Match>
          );
        })}
      </S.List>
    </S.Container>
  );
};

export { MatchListPage };
