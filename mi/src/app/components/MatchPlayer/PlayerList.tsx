import { PlayerInfo } from "./PlayerInfo";
import { MatchStore, useMatchStore } from "./matchStore";
import * as S from "./styled";

const stateSelector = ({ match, currentPlayer }: MatchStore) => ({
  players: match?.players,
  currentPlayer,
});

export const PlayerList = () => {
  const { players, currentPlayer } = useMatchStore(stateSelector);
  if (!players || !currentPlayer) {
    return null;
  }
  return (
    <S.PlayerListContainer>
      <S.CurrentPlayer>
        <PlayerInfo id={currentPlayer.id} name={currentPlayer.name} />
      </S.CurrentPlayer>
      <S.OtherPlayers>
        {Object.values(players).map(({ name, id }) =>
          currentPlayer.id === id ? null : (
            <S.PlayerItem>
              <PlayerInfo name={name} id={id} />
            </S.PlayerItem>
          )
        )}
      </S.OtherPlayers>
    </S.PlayerListContainer>
  );
};
