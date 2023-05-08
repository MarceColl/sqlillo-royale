import styled from "styled-components";
import {
  CaretLeftFill,
  CaretRightFill,
  PauseFill,
  PlayFill,
} from "grommet-icons";

export const ControlsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
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
