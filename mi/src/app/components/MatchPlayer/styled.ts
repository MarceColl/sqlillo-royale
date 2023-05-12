import styled from "styled-components";
import {
  CaretLeftFill,
  CaretRightFill,
  FormViewHide,
  PauseFill,
  PlayFill,
  View,
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
`;
export const ControlButton = styled.div<{ $size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ $size }) => `${$size}rem`};
  height: ${({ $size }) => `${$size}rem`};
  border-radius: 50%;
  background-color: #333;
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
  max-height: 50vh;
  min-height: 70px;
  padding: 1rem;
  width: 300px;
  resize: vertical;
`;

export const PlayerItem = styled.div`
  flex: 1;
  display: flex;
  padding: 0.5rem 1rem;
`;

export const PlayerInfo = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  gap: 1rem;
`;

export const Name = styled.div`
  font-size: 2rem;
`;

export const OtherPlayers = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #111;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

export const Color = styled.div<{ $color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: flex;
  justify-content: center;
  align-content: center;
`;
export const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`;

export const NameNameContainer = styled.div`
  display: flex;
  gap: 5px;
`;

export const ViewIcon = styled(View)``;
export const NoViewIcon = styled(FormViewHide)``;

export const CurrentPlayer = styled.div`
  padding: 0 0 1rem;
`;
