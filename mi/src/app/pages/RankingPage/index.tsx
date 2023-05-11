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
        <thead>
          <tr>
            <th>#</th>
            <th>user</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map(({ id, username }, i) => {
            return (
              <S.Match key={id}>
                <td>{i + 1}</td>
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
