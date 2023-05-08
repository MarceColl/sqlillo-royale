import * as THREE from "three";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";

import domeVS from "@/app/shaders/dome.vs";
import domeFS from "@/app/shaders/dome.fs";

import { Match } from "./types";
import { Bullets } from "./Bullets";
import { DroidPlayers } from "./DroidPlayers";
import { useFrame } from "@react-three/fiber";
import { useMatchStore } from "./matchStore";
import { TICK_RATE_MS } from "./constants";

type MatchSceneProps = {
  match: Match;
};
// hex value from vec3(5.0 / 255.0, 10.0 / 255.0, 25.0 / 255.0);
const skyColor = 0x050a19;
// hex value from vec3(10.0 / 255.0, 90.0 / 255.0, 100.0 / 255.0);
const groundColor = 0x045460;

const MatchScene = ({ match }: MatchSceneProps) => {
  useFrame(({ clock }) => {
    const { state, setTick } = useMatchStore.getState();
    const currentTick = Math.round(
      (clock.elapsedTime * TICK_RATE_MS) % match.ticks.length
    );
    if (state === "playing") {
      setTick(currentTick);
      if (!clock.running) {
        clock.start();
        clock.elapsedTime = currentTick / TICK_RATE_MS;
      }
    } else {
      if (clock.running) {
        clock.stop();
      }
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault far={2000} />
      <OrbitControls
        target={[0, 1.75, 0]}
        maxDistance={match.map.size[0] * 1.5}
        maxAzimuthAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
      <mesh>
        <sphereGeometry args={[match.map.size[0] * 2, 32, 32]} />
        <shaderMaterial
          attach="material"
          vertexShader={domeVS}
          fragmentShader={domeFS}
          side={THREE.DoubleSide}
        />
      </mesh>
      <ambientLight intensity={3} />
      <hemisphereLight args={[skyColor, groundColor, 100]} />
      <Grid
        cellColor="#666"
        sectionColor="#444"
        sectionSize={10}
        cellSize={5}
        args={match.map.size}
        fadeDistance={800}
      />
      <group position={[0, 1.75, 0]}>
        <Bullets match={match} />
        <DroidPlayers match={match} />
      </group>
    </>
  );
};

export { MatchScene };
