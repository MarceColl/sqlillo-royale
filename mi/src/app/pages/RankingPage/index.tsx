import { useQuery } from "react-query";

import { Queries } from "@/app/constants";
import * as API from "@/app/API";
import * as S from "./styled";
import { useState } from "react";

const RankingPage = () => {
  const showFirstTab = true;
  const showSecondTab = true;
  const showThirdTab = true;
  const showAnyTab = showFirstTab || showSecondTab || showThirdTab;
  const [filter, setFilter] = useState<1 | 2 | 3 | null>(null);
  const { data, isLoading } = useQuery([Queries.ranking, filter], () => {
    return API.getRanking({ type: filter || undefined });
  });
  const handleTabChange = (tab: 1 | 2 | 3 | null) => () => {
    setFilter(tab);
  };
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { ranking } = data;

  return (
    <S.Container>
      <S.Back onClick={() => window.history.back()}>
        <S.BackIcon size="large" />
      </S.Back>
      <S.Content>
        {showAnyTab && (
          <>
            <S.TabContainer>
              <S.Tab $active={filter === null} onClick={handleTabChange(null)}>
                Last 24h ranking
              </S.Tab>
              {showFirstTab && (
                <S.Tab $active={filter === 1} onClick={handleTabChange(1)}>
                  Ranked round 1
                </S.Tab>
              )}
              {showSecondTab && (
                <S.Tab $active={filter === 2} onClick={handleTabChange(2)}>
                  Ranked round 2
                </S.Tab>
              )}
              {showThirdTab && (
                <S.Tab $active={filter === 3} onClick={handleTabChange(3)}>
                  Final round
                </S.Tab>
              )}
            </S.TabContainer>
          </>
        )}
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
      </S.Content>
    </S.Container>
  );
};

export { RankingPage };
