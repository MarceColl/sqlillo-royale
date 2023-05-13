import * as THREE from "three";
import {
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";

import domeVS from "@/app/shaders/dome.vs";
import domeFS from "@/app/shaders/dome.fs";

import { Bullets } from "./Bullets";
import { DroidPlayers } from "./DroidPlayers";
import { useFrame } from "@react-three/fiber";
import { useMatchStore } from "./matchStore";
import { TICK_RATE_MS } from "./constants";
import { useRef } from "react";
import { Cod } from "./Cod";
import { Obstacles } from "./Obstacles";

const followPos = new THREE.Object3D();
// hex value from vec3(5.0 / 255.0, 10.0 / 255.0, 25.0 / 255.0);
const skyColor = 0x050a19;
// hex value from vec3(10.0 / 255.0, 90.0 / 255.0, 100.0 / 255.0);
const groundColor = 0x045460;

const matchMapSizeSelector = (state: any) => state.match?.map.size[0];

const MatchScene = () => {
  const obRef = useRef<any>(null);
  // Advance state
  useFrame(({ clock }) => {
    const { state, setTick, match } = useMatchStore.getState();
    if (!match) return;
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
  // Orbit controls follow
  useFrame(() => {
    const { getGameState, followingPlayer, match } = useMatchStore.getState();
    const gameState = getGameState();
    if (!gameState) return;
    if (!match) return;
    if (!obRef.current) return;
    if (followingPlayer !== null) {
      const player = gameState.players.find(({ id }) => followingPlayer === id);
      if (!player) return;
      const [x, y] = player.pos;
      const { current: ob } = obRef;
      followPos.position.set(
        x - match.map.size[0] / 2,
        1.75,
        y - match.map.size[1] / 2
      );
      ob.enabled = false;
      followPos.add(ob.object);
      ob.target.set(x - match.map.size[0] / 2, 1.75, y - match.map.size[1] / 2);
      ob.update();
    } else {
      if (!obRef.current) return;
      const { current: ob } = obRef;
      if (followPos.children.length) {
        followPos.clear();
      }
      ob.enabled = true;
    }
  });
  const matchMapSize = useMatchStore(matchMapSizeSelector);
  return (
    <>
      <PerspectiveCamera
        makeDefault
        far={2000}
        position={[matchMapSize * 2, matchMapSize * 2, 0]}
      />
      <Environment preset="city" />
      <OrbitControls
        ref={obRef}
        target={[0, 1.75, 0]}
        maxDistance={matchMapSize * 1.5}
        maxAzimuthAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
      <mesh>
        <sphereGeometry args={[matchMapSize * 2, 32, 32]} />
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
        args={[matchMapSize, matchMapSize]}
        fadeDistance={800}
      />
      <group position={[0, 1.75, 0]}>
        <Bullets />
        <DroidPlayers />
        <Cod />
        <Obstacles />
      </group>
    </>
  );
};

export { MatchScene };
