import {
  Bounds,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Match } from "./types";
import { Players } from "./Players";
import { Bullets } from "./Bullets";

type MatchSceneProps = {
  match: Match;
};

const MatchScene = ({ match }: MatchSceneProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault far={1000} />
      <OrbitControls target={[0, 1.75, 0]} />
      <Grid
        cellColor="#eee"
        sectionColor="#fff"
        sectionSize={10}
        cellSize={5}
        args={match.map.size}
        fadeDistance={800}
      />
      <hemisphereLight intensity={0.5} args={["#fff", "#000", 1]} />
      <group position={[0, 1.75, 0]}>
        <Bullets match={match} />
        <Players match={match} />
      </group>
    </>
  );
};

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
    </div>
  );
};
