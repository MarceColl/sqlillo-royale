import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EntityKind, Match } from "./types";
import { useRef } from "react";
import { TICK_RATE_MS } from "./constants";

const tempBullets = new THREE.Object3D();

type Props = {
  match: Match;
};

const Bullets = ({ match }: Props) => {
  const material = new THREE.MeshToonMaterial({ color: "yellow" });
  const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const ref = useRef();
  const mapOffset = new THREE.Vector3(
    -match.map.size[0] / 2,
    0,
    -match.map.size[1] / 2
  );

  useFrame(({ clock }) => {
    const currentTick = Math.round(
      (clock.elapsedTime * TICK_RATE_MS) % match.ticks.length
    );
    for (const entity of match.ticks[currentTick].entities) {
      if (entity.kind !== EntityKind.BULLET) continue;
      const [x, y] = entity.pos;
      tempBullets.position.set(x, 0, y);
      tempBullets.position.add(mapOffset);
      tempBullets.updateMatrix();
      ref.current.setMatrixAt(entity.id - 200, tempBullets.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[sphereGeometry, material, 200]} />;
};

export { Bullets };