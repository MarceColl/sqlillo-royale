import { Canvas } from "@react-three/fiber";
import { MatchScene } from "./MatchScene";
import { Controls } from "./Controls";
import { PlayerList } from "./PlayerList";
import styled from "styled-components";

const UI = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

type Props = {
  className?: string;
};

export const MatchPlayer = ({ className }: Props) => {
  return (
    <UI className={className}>
      <Canvas>
        <MatchScene />
      </Canvas>
      <Controls />
      <PlayerList />
    </UI>
  );
};
