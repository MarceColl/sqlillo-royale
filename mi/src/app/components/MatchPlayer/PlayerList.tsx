import { MatchStore, useMatchStore } from "./matchStore";
import * as S from "./styled";

const stateSelector = ({
  followPlayer,
  followingPlayer,
  match,
}: MatchStore) => ({
  followPlayer,
  followingPlayer,
  players: match?.players,
});

export const PlayerList = () => {
  const { followPlayer, followingPlayer, players } =
    useMatchStore(stateSelector);
  if (!players) {
    return null;
  }
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
