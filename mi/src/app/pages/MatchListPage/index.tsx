import { useQuery } from "react-query";

import { Queries, Routes } from "@/app/constants";
import * as API from "@/app/API";
import * as S from "./styled";
import { Link } from "@/modules/Router";
import { Anchor } from "@/app/ui";

const MatchListPage = () => {
  const { data, isLoading } = useQuery([Queries.matchList], API.getMatchList);
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { matchList } = data;

  return (
    <S.Container>
      <S.List>
        <thead>
          <tr>
            <th>id</th>
            <th>size</th>
            <th>nº players</th>
            <th>duration</th>
            <th>time</th>
          </tr>
        </thead>
        <tbody>
          {matchList.map(({ id, config, created_at }) => {
            const { duration, num_players, tick_time, height, weight } = config;
            const seconds = duration * tick_time;
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
                <td>{Math.round(seconds)} s</td>
                <td>
                  {
                    // localized hour
                    date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                </td>
              </S.Match>
            );
          })}
        </tbody>
      </S.List>
    </S.Container>
  );
};

export { MatchListPage };
