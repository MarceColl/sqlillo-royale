import { ShiftBy } from "@/app/ui";
//import { Bar } from "../Bar";
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
  // const health = 100;
  const handleToggleFollow = () => {
    console.log("following", followingPlayer, id);
    if (followingPlayer === id) {
      followPlayer(null);
    } else {
      followPlayer(id);
    }
  };
  return (
    <>
      <S.PlayerInfo onClick={handleToggleFollow}>
        <S.Color $color={"transparent"}>
          <ShiftBy $x={-1} $y={2}>
            {followingPlayer === id ? <S.NoViewIcon /> : <S.ViewIcon />}
          </ShiftBy>
        </S.Color>
        <S.NameContainer>
          <S.NameNameContainer>
            <S.Name>{name}</S.Name>
          </S.NameNameContainer>
          {/* TODO: health<Bar completion={health || 0} /> */}
        </S.NameContainer>
      </S.PlayerInfo>
    </>
  );
};
