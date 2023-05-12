import styled, { css } from "styled-components";
import {
  CaretLeftFill,
  CaretRightFill,
  PauseFill,
  PlayFill,
} from "grommet-icons";
import { Card } from "@/app/ui";

export const ControlsContainer = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;
export const ControlButton = styled.div<{ $size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ $size }) => `${$size}rem`};
  height: ${({ $size }) => `${$size}rem`};
  border-radius: 50%;
  background-color: #712fff;
  cursor: pointer;
`;

export const PlayIcon = styled(PlayFill).attrs({ color: "#fff" })``;
export const PauseIcon = styled(PauseFill).attrs({ color: "#fff" })``;
export const PreviousIcon = styled(CaretLeftFill).attrs({ color: "#fff" })``;
export const NextIcon = styled(CaretRightFill).attrs({ color: "#fff" })``;

export const PlayerListContainer = styled(Card)`
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PlayerItem = styled.div<{ $following: boolean }>`
  display: flex;
  padding: 0.5rem 1rem;
  cursor: pointer;
  ${({ $following }) =>
    $following &&
    css`
      border: thin solid red;
    `}
`;
