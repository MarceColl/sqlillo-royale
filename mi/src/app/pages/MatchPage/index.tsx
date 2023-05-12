import { Queries } from "@/app/constants";
import { useQuery } from "react-query";

//import traces from "@/../traces.json";

import * as API from "@/app/API";
import * as S from "./styled";
import { mapTracesToFrontend } from "@/app/components/MatchPlayer/utils";
import { RawMatch } from "@/app/components/MatchPlayer/types";
import { useEffect } from "react";
import { useMatchStore } from "@/app/components/MatchPlayer/matchStore";

type Props = {
  matchId: string;
  carouselle?: boolean;
};

const MatchPage = ({ matchId, carouselle }: Props) => {
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
    const { setMatch } = useMatchStore.getState();
    const match = mapTracesToFrontend({
      map: data.match.map,
      traces: gameData,
    } as RawMatch);
    setMatch(match, carouselle);
  }, [data?.match.map, gameData]);

  if (isLoading || !data || isDataLoading || !gameData) {
    return <>Loading...</>;
  }

  const { match } = data || {};

  return (
    <S.Container>
      <div>Seeing match: {match.name}</div>
      <S.MatchPlayer />
    </S.Container>
  );
};

export { MatchPage };
