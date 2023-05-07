import * as THREE from "three";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import domeVS from "@/app/shaders/dome.vs";
import domeFS from "@/app/shaders/dome.fs";

import { Match } from "./types";
import { Players } from "./Players";
import { Bullets } from "./Bullets";

type MatchSceneProps = {
  match: Match;
};

const MatchScene = ({ match }: MatchSceneProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault far={2000} />
      <OrbitControls target={[0, 1.75, 0]} />
      <mesh>
        <sphereGeometry args={[match.map.size[0] * 2, 32, 32]} />
        <shaderMaterial
          attach="material"
          vertexShader={domeVS}
          fragmentShader={domeFS}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Grid
        cellColor="#666"
        sectionColor="#444"
        sectionSize={10}
        cellSize={5}
        args={match.map.size}
        fadeDistance={800}
      />
      <hemisphereLight intensity={0.8} args={["#fff", "#000", 1]} />
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
