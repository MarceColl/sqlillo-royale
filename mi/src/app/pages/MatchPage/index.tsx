import { Queries } from "@/app/constants";
import { useQuery } from "react-query";

import * as API from "@/app/API";

type Props = {
  matchId: string;
};

const MatchPage = ({ matchId }: Props) => {
  const { data, isLoading } = useQuery([Queries.match, matchId], () => {
    return API.getMatch({ id: matchId });
  });
  if (isLoading || !data) {
    return <>Loading...</>;
  }
  const { match } = data;
  return <div>Seeing match: {match.name}</div>;
};

export { MatchPage };
