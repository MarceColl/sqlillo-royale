import { MatchStore, useMatchStore } from "./matchStore";
import * as S from "./styled";
import { PlayerInfo } from "./types";

type Props = {
  players: Record<number, PlayerInfo>;
};
const stateSelector = ({ followPlayer, followingPlayer }: MatchStore) => ({
  followPlayer,
  followingPlayer,
});

export const PlayerList = ({ players }: Props) => {
  const { followPlayer, followingPlayer } = useMatchStore(stateSelector);
  return (
    <S.PlayerListContainer>
      {Object.values(players).map(({ name, id }) => (
        <S.PlayerItem
          key={id}
          $following={id === followingPlayer}
          onClick={() => followPlayer(id)}
        >
          {name}
        </S.PlayerItem>
      ))}
    </S.PlayerListContainer>
  );
};
