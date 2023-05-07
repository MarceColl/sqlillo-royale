import { useQuery } from "react-query";

import { Queries } from "@/app/constants";
import * as API from "@/app/API";
import * as S from "./styled";

const RankingPage = () => {
  const { data, isLoading } = useQuery([Queries.ranking], API.getRanking);
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { ranking } = data;
  return (
    <S.Container>
      <S.List>
        {ranking.map(({ username }, i) => {
          return <S.User>{username}</S.User>;
        })}
      </S.List>
    </S.Container>
  );
};

export { RankingPage };
