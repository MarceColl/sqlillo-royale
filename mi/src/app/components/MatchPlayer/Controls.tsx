import { useMatchStore } from "./matchStore";
import * as S from "./styled";

export const Controls = () => {
  const { state, play, pause, advanceTicks, rewindTicks } = useMatchStore();
  return (
    <S.ControlsContainer>
      <S.ControlButton $size={2}>
        <S.PreviousIcon
          onClick={() => (state === "paused" ? rewindTicks(1) : undefined)}
        />
      </S.ControlButton>
      <S.ControlButton $size={3.5}>
        {state === "paused" ? (
          <S.PlayIcon onClick={play} />
        ) : (
          <S.PauseIcon onClick={pause} />
        )}
      </S.ControlButton>
      <S.ControlButton $size={2}>
        <S.NextIcon
          onClick={() => (state === "paused" ? advanceTicks(1) : undefined)}
        />
      </S.ControlButton>
    </S.ControlsContainer>
  );
};
