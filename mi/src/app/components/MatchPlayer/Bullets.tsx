import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { MatchStore, useMatchStore } from "./matchStore";

const tempBullets = new THREE.Object3D();
const mapOffset = new THREE.Vector3();

const bulletSizeSelector = (state: MatchStore) =>
  state.gameState?.bullets.length;

const Bullets = () => {
  const material = new THREE.MeshToonMaterial({ color: "yellow" });
  const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const ref = useRef<THREE.InstancedMesh>(null);
  const bulletsLength = useMatchStore(bulletSizeSelector);

  useFrame(() => {
    if (!ref.current) return;
    const { gameState, match } = useMatchStore.getState();
    if (!match) return;
    if (!gameState) return;
    for (let i = 0; i < gameState.bullets.length; i++) {
      const [x, y] = gameState.bullets[i].pos;
      tempBullets.position.set(x, 0, y);
      mapOffset.set(-match.map.size[0] / 2, 0, -match.map.size[1] / 2);
      tempBullets.position.add(mapOffset);
      tempBullets.updateMatrix();
      ref.current.setMatrixAt(i, tempBullets.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
	ref={ref}
	args={[sphereGeometry, material, bulletsLength || 0]}
      />
      <pointLight />
    </group>
  );
};

export { Bullets };
