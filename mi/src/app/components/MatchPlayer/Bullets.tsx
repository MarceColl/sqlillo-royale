import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EntityKind, Match } from "./types";
import { useRef } from "react";
import { useCurrentTickRef } from "./hooks";

const tempBullets = new THREE.Object3D();

type Props = {
  match: Match;
};

const Bullets = ({ match }: Props) => {
  const material = new THREE.MeshToonMaterial({ color: "yellow" });
  const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const ref = useRef<THREE.InstancedMesh>(null);
  const mapOffset = new THREE.Vector3(
    -match.map.size[0] / 2,
    0,
    -match.map.size[1] / 2
  );

  const currentTickRef = useCurrentTickRef();

  useFrame(() => {
    if (!currentTickRef.current) return;
    if (!ref.current) return;
    const { current: currentTick } = currentTickRef;
    for (const entity of match.ticks[currentTick].entities) {
      if (entity.kind !== EntityKind.BULLET) continue;
      // No bullets?
      console.log(entity);
      const [x, y] = entity.pos;
      tempBullets.position.set(x, 0, y);
      tempBullets.position.add(mapOffset);
      tempBullets.updateMatrix();
      // TODO: identify bullets correctly
      ref.current.setMatrixAt(entity.id - 4, tempBullets.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[sphereGeometry, material, 200]} />;
};

export { Bullets };
