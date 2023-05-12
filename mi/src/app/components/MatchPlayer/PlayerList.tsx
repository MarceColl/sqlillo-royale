import { PlayerInfo } from "./PlayerInfo";
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
  const { players } = useMatchStore(stateSelector);
  if (!players) {
    return null;
  }
  return (
    <S.PlayerListContainer>
      <S.CurrentPlayer>
        <PlayerInfo id={1} name={"name"} />
      </S.CurrentPlayer>
      <S.OtherPlayers>
        {Object.values(players).map(({ name, id }) => (
          <S.PlayerItem>
            <PlayerInfo name={name} id={id} />
          </S.PlayerItem>
        ))}
      </S.OtherPlayers>
    </S.PlayerListContainer>
  );
};
