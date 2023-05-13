import { useEffect } from "react";
import { useQuery } from "react-query";

import * as API from "@/app/API";
import { RawMap } from "../components/MatchPlayer/types";
import { useMatchStore } from "../components/MatchPlayer/matchStore";
import { mapTracesToFrontend } from "../components/MatchPlayer/utils";
import { Queries } from "../constants";

type Input = {
  id: string;
  name: string;
  map: RawMap;
};
export const useConnectMatch = ({ id, name, map }: Partial<Input>) => {
  let init = false;

  const { data: userInfo, isLoading: infoLoading } = useQuery(
    [Queries.userInfo],
    API.getUserInfo
  );
  useEffect(() => {
    if (!id || !name || !map || !userInfo) return;
    const socket = new WebSocket(`ws://localhost:8000/api/games/${id}/ws`);

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Connected!");
    });
    // Listen for messages
    socket.addEventListener("message", async (event) => {
      const { setState, rawTraces } = useMatchStore.getState();
      const rt = rawTraces || [];

      const t = await event.data.text();
      const trace = JSON.parse(t);
      const match = mapTracesToFrontend({
        id,
        name: name,
        map: map,
        traces: [...rt, trace],
      });
      if (!init) {
        init = true;
        const currentPlayer = match.players
          ? Object.values(match.players).find(
              ({ name }) => name === userInfo.username
            )
          : null;
        setState({ currentPlayer });
      }
      setState({ match, rawTraces: [...rt, trace] });
    });
  }, [id, infoLoading]);
};
