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
      <S.Back onClick={() => window.history.back()}>
        <S.BackIcon size="large" />
      </S.Back>
      <S.List>
        <thead>
          <tr>
            <th>ELO</th>
            <th>Userillo</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map(({ username, rank }) => {
            return (
              <S.Match key={username}>
                <td>{rank}</td>
                <td>{username}</td>
              </S.Match>
            );
          })}
        </tbody>
      </S.List>
    </S.Container>
  );
};

export { RankingPage };
