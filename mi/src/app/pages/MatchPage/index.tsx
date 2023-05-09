import { Queries } from "@/app/constants";
import { useQuery } from "react-query";
import traces from "@/../traces.json";

import * as API from "@/app/API";
import * as S from "./styled";
import { mapTracesToFrontend } from "@/app/components/MatchPlayer/utils";
import { RawMatch } from "@/app/components/MatchPlayer/types";
import { useMemo } from "react";

type Props = {
  matchId: string;
};

const MatchPage = ({ matchId }: Props) => {
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

  const parsedTraces = useMemo(
    () => {
      if (!data?.match.map || !gameData) {
        return null;
      }

      return mapTracesToFrontend({
        map: data?.match.map!,
        traces: gameData
      } as RawMatch)
    },
    [data?.match.map, gameData]
  );

  if (isLoading || !data || isDataLoading || !gameData || !parsedTraces) {
    return <>Loading...</>;
  }

  const { match } = data || {};

  return (
    <S.Container>
      <div>Seeing match: {match.name}</div>
      <S.MatchPlayer match={parsedTraces} />
    </S.Container>
  );
};

export { MatchPage };
