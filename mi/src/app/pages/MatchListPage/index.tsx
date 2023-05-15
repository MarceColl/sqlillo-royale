import { useQuery } from "react-query";

import { Queries, Routes } from "@/app/constants";
import * as API from "@/app/API";
import * as S from "./styled";
import { Link } from "@/modules/Router";
import { Anchor } from "@/app/ui";
import { useState } from "react";

const MatchListPage = () => {
  const showFirstTab = true;
  const showSecondTab = true;
  const showThirdTab = true;
  const showAnyTab = showFirstTab || showSecondTab || showThirdTab;
  const [filter, setFilter] = useState<1 | 2 | 3 | null>(null);
  const { data, isLoading } = useQuery([Queries.matchList, filter], () => {
    return API.getMatchList({ type: filter || undefined });
  });
  const handleTabChange = (tab: 1 | 2 | 3 | null) => () => {
    setFilter(tab);
  };
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { matchList } = data;
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
                Casual ranking (ran every 20 min.)
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
              <th>id</th>
              <th>size</th>
              <th>nº players</th>
              <th>time</th>
            </tr>
          </thead>
          <tbody>
            {matchList.map(({ id, config, created_at }: any) => {
              const { num_players, height, weight } =
                config;
              const date = new Date(created_at);
              return (
                <S.Match key={id}>
                  <td>
                    <Link to={Routes.match} params={{ id }}>
                      <Anchor>{id.split("-")[0]}</Anchor>
                    </Link>
                  </td>
                  <td>
                    {height} x {weight}
                  </td>
                  <td>{num_players}</td>
                  <td>
                    {
                      // localized hour
                      date.toLocaleString("en-US")
                    }
                  </td>
                </S.Match>
              );
            })}
          </tbody>
        </S.List>
      </S.Content>
    </S.Container>
  );
};

export { MatchListPage };
