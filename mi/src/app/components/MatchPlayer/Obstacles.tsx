import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MatchStore, useMatchStore } from "./matchStore";
import { useRef } from "react";

import codVS from "@/app/shaders/cod.vs";
import codFS from "@/app/shaders/cod.fs";

const mapOffset = new THREE.Vector3();
const tempObstacles = new THREE.Object3D();
const RADIUS = 3;

const bulletSizeSelector = (state: MatchStore) =>
  state.getGameState()?.obstacles?.length;

const Obstacles = () => {
  const material = new THREE.ShaderMaterial({
    vertexShader: codVS,
    fragmentShader: codFS,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
  });
  const ref = useRef<THREE.InstancedMesh>(null);
  const geom = new THREE.CylinderGeometry(RADIUS, RADIUS, 10, 32);
  const obstaclesLength = useMatchStore(bulletSizeSelector);

  useFrame(() => {
    const { getGameState, match } = useMatchStore.getState();
    const gameState = getGameState();
    if (!match) return;
    if (!gameState) return;
    if (!gameState.cod) return;
    if (!ref.current) return;
    for (let i = 0; i < gameState.obstacles?.length; i++) {
      const [x, y] = gameState.obstacles[i].pos;
      tempObstacles.position.set(x, 0, y);
      mapOffset.set(-match.map.size[0] / 2, 0, -match.map.size[1] / 2);
      tempObstacles.position.add(mapOffset);
      tempObstacles.updateMatrix();
      ref.current.setMatrixAt(i, tempObstacles.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={ref} args={[geom, material, obstaclesLength || 0]} />
    </group>
  );
};

export { Obstacles };
