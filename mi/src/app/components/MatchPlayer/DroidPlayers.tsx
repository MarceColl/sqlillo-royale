import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EntityKind, Match } from "./types";
import { useRef } from "react";
import droidUrl from "@/app/assets/DROID.glb?url";
import { useGLTF } from "@react-three/drei";
import { useMatchStore } from "./matchStore";

const tempPlayers = new THREE.Object3D();
const tempColor = new THREE.Color();

type Props = {
  match: Match;
};

const DroidPlayers = ({ match }: Props) => {
  const { nodes, materials } = useGLTF(droidUrl) as any;
  const mesh6 = useRef<THREE.InstancedMesh>(null);
  const mesh5 = useRef<THREE.InstancedMesh>(null);
  const mesh4 = useRef<THREE.InstancedMesh>(null);
  const body = useRef<THREE.InstancedMesh>(null);
  const metal = useRef<THREE.InstancedMesh>(null);
  const color = useRef<THREE.InstancedMesh>(null);
  const meshes = [mesh6, mesh5, mesh4, body, metal, color];
  const mapOffset = new THREE.Vector3(
    -match.map.size[0] / 2,
    0,
    -match.map.size[1] / 2
  );

  useFrame(() => {
    const { tick: currentTick } = useMatchStore.getState();
    for (const entity of match.ticks[currentTick].entities) {
      if (entity.kind !== EntityKind.PLAYER) continue;
      const isAlive = entity.health > 0;
      const [x, y] = isAlive ? entity.pos : [0, 1000];
      tempPlayers.position.set(x, 0, y);
      tempPlayers.position.add(mapOffset);
      tempPlayers.rotation.set(0, Math.sin(currentTick / 10), 0);
      tempColor.setRGB(Math.random(), Math.random(), Math.random());
      tempPlayers.updateMatrix();
      for (const mesh of meshes) {
        if (!mesh.current) continue;
        mesh.current.setMatrixAt(entity.id, tempPlayers.matrix);
        mesh.current.instanceMatrix.needsUpdate = true;
      }
      // TODO: identify players correctly
      metal.current?.setColorAt(entity.id, tempColor);
    }
    // ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={color}
        args={[nodes.Roundcube003.geometry, materials.COLOR, 200]}
      />
      <instancedMesh
        ref={metal}
        args={[nodes.Roundcube003_1.geometry, materials.metal, 200]}
      />
      <instancedMesh
        ref={body}
        args={[nodes.Roundcube003_2.geometry, materials.plastic, 200]}
      />
      <instancedMesh
        ref={mesh4}
        args={[nodes.Roundcube003_3.geometry, materials.GLOE, 200]}
      />
      <instancedMesh
        ref={mesh5}
        args={[nodes.Roundcube003_4.geometry, materials.logo, 200]}
      />
      <instancedMesh
        ref={mesh6}
        args={[nodes.Roundcube003_5.geometry, materials.LOGO, 200]}
      />
    </group>
  );
};

export { DroidPlayers };

useGLTF.preload(droidUrl);
