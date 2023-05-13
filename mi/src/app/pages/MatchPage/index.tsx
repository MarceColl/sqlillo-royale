import { Queries } from "@/app/constants";
import { useQuery } from "react-query";

//import traces from "@/../traces.json";

import * as API from "@/app/API";
import * as S from "./styled";
import { mapTracesToFrontend } from "@/app/components/MatchPlayer/utils";
import { useEffect } from "react";
import { useMatchStore } from "@/app/components/MatchPlayer/matchStore";

type Props = {
  matchId: string;
  carouselle?: boolean;
};

const MatchPage = ({ matchId, carouselle }: Props) => {
  const { data: userInfo, isLoading: infoLoading } = useQuery(
    [Queries.userInfo],
    API.getUserInfo
  );
  const { data, isLoading } = useQuery(
    [Queries.match, matchId],
    () => {
      return API.getMatch({ id: matchId });
    },
    { refetchOnWindowFocus: false }
  );

  const { data: gameData, isLoading: isDataLoading } = useQuery(
    [Queries.matchData, matchId],
    () => {
      return API.getMatchData({ id: matchId });
    },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (!data?.match.map || !gameData) {
      return;
    }
    const { setState } = useMatchStore.getState();
    const match = mapTracesToFrontend({
      id: data.match.id,
      name: data.match.name,
      map: data.match.map,
      traces: gameData,
    });
    const currentPlayer = match.players
      ? Object.values(match.players).find(
          ({ name }) => name === userInfo?.username
        )
      : null;
    setState({
      match,
      currentPlayer,
      ...(carouselle ? { carouselle: true, state: "playing" } : {}),
    });
  }, [data?.match.map, gameData, userInfo, infoLoading]);

  if (isLoading || !data || isDataLoading || !gameData) {
    return <>Loading...</>;
  }

  const { match } = data || {};

  return (
    <S.Container>
      <S.MatchPlayer />
      <S.MatchTitle>{match.id.split("-")[0]}</S.MatchTitle>
    </S.Container>
  );
};

export { MatchPage };
