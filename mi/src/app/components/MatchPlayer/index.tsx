import { Canvas } from "@react-three/fiber";
import { Match } from "./types";
import { MatchScene } from "./MatchScene";
import { Controls } from "./Controls";

type Props = {
  match: Match;
  className?: string;
};

export const MatchPlayer = ({ match, className }: Props) => {
  return (
    <div className={className}>
      <Canvas>
        <MatchScene match={match} />
      </Canvas>
      <Controls />
    </div>
  );
};
