import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EntityKind, Match } from "./types";
import { useRef } from "react";
import { TICK_RATE_MS } from "./constants";

const tempPlayers = new THREE.Object3D();
const tempColor = new THREE.Color();

type Props = {
  match: Match;
};

const Players = ({ match }: Props) => {
  const material = new THREE.MeshPhysicalMaterial({
    color: "white",
    metalness: 0.2,
    roughness: 0.5,
  });
  const boxesGeometry = new THREE.CapsuleGeometry(1, 1.5, 8, 16);
  const ref = useRef<THREE.InstancedMesh>();
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
      if (entity.kind !== EntityKind.PLAYER) continue;
      if (entity.health <= 0) continue;
      const [x, y] = entity.pos;
      tempPlayers.position.set(x, 0, y);
      tempPlayers.position.add(mapOffset);
      tempColor.setRGB(Math.random(), Math.random(), Math.random());
      tempPlayers.updateMatrix();
      ref.current?.setColorAt(entity.id, tempColor);
      ref.current.setMatrixAt(entity.id, tempPlayers.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    // ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[boxesGeometry, material, 200]} />;
};

export { Players };
