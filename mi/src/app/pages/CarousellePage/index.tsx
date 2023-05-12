import { Queries } from "@/app/constants";
import { useQuery } from "react-query";

import * as API from "@/app/API";
import { MatchPage } from "..";

const CarousellePage = () => {
  const { data, isLoading } = useQuery(
    [Queries.carouselle],
    () => {
      return API.getCarouselle();
    },
    { refetchOnWindowFocus: false }
  );

  if (isLoading || !data) {
    return <>Loading...</>;
  }

  return <MatchPage matchId={data.id} carouselle />;
};

export { CarousellePage };
