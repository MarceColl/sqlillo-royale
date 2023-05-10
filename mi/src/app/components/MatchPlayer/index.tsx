import { Canvas } from "@react-three/fiber";
import { MatchScene } from "./MatchScene";
import { Controls } from "./Controls";
import { PlayerList } from "./PlayerList";

type Props = {
  className?: string;
};

export const MatchPlayer = ({ className }: Props) => {
  return (
    <div className={className}>
      <Canvas>
        <MatchScene />
      </Canvas>
      <Controls />
      <PlayerList />
    </div>
  );
};
