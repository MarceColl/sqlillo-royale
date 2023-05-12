import { ShiftBy } from "@/app/ui";
import { Bar } from "../Bar";
import { MatchStore, useMatchStore } from "./matchStore";
import * as S from "./styled";

const stateSelector = ({ followPlayer, followingPlayer }: MatchStore) => ({
  followPlayer,
  followingPlayer,
});

type Props = {
  id: number;
  name: string;
};

export const PlayerInfo = ({ id, name }: Props) => {
  const { followPlayer, followingPlayer } = useMatchStore(stateSelector);
  // TODO: subscribe to gamestate
  const health = 100;
  return (
    <>
      <S.PlayerInfo onClick={() => followPlayer(id)}>
        <S.Color $color={"transparent"}>
          <ShiftBy $x={-1} $y={2}>
            {followingPlayer === id ? <S.NoViewIcon /> : <S.ViewIcon />}
          </ShiftBy>
        </S.Color>
        <S.NameContainer>
          <S.NameNameContainer>
            <S.Name>{name}</S.Name>
          </S.NameNameContainer>
          <Bar completion={health || 0} />
        </S.NameContainer>
      </S.PlayerInfo>
    </>
  );
};
