import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMatchStore } from "./matchStore";
import { useRef } from "react";

import codVS from "@/app/shaders/cod.vs";
import codFS from "@/app/shaders/cod.fs";

const mapOffset = new THREE.Vector3();
const restPosition = new THREE.Vector3(5000, 5000, 5000);

const Cod = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { getGameState, match } = useMatchStore.getState();
    const gameState = getGameState();
    if (!match) return;
    if (!gameState) return;
    if (!gameState.cod) return;
    if (!ref.current) return;
    const { current: cod } = ref;
    const { pos, radius } = gameState.cod;
    const [x, y] = pos;
    if (x === -1) {
      cod.position.copy(restPosition);
      return;
    }
    mapOffset.set(-match.map.size[0] / 2, 0, -match.map.size[1] / 2);
    cod.position.set(x, 0, y).add(mapOffset);
    cod.scale.set(radius, 1, radius);
  });

  return (
    <mesh ref={ref} position={restPosition}>
      <cylinderGeometry args={[1, 1, 100, 64]} />
      {/* <meshStandardMaterial color={"hotpink"} transparent opacity={0.5} /> */}
      <shaderMaterial
        attach="material"
        vertexShader={codVS}
        fragmentShader={codFS}
        side={THREE.DoubleSide}
        transparent={true}
        depthTest={false}
      />
    </mesh>
  );
};

export { Cod };
