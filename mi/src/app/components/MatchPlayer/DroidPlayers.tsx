import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import droidUrl from "@/app/assets/DROID.glb?url";
import { useGLTF } from "@react-three/drei";
import { MatchStore, useMatchStore } from "./matchStore";
import { Skill } from "./types";

const tempPlayers = new THREE.Object3D();
const tempMelee = new THREE.Object3D();
const tempLife = new THREE.Object3D();
const tempColor = new THREE.Color();
const mapOffset = new THREE.Vector3();
const markerPos = new THREE.Vector3();
const hidePos = new THREE.Vector3(0, 5000, 0);
const markerOffset = new THREE.Vector3(0, 70, 0);
const meleeOffset = new THREE.Vector3(0, 2, 0);
const lifeOffset = new THREE.Vector3(0, -10, 0);
const tempLifeColor = new THREE.Color();
const black = new THREE.Color("black");

const lifeGeom = new THREE.CylinderGeometry(5, 1, 16, 32);
const lifeMat = new THREE.MeshPhongMaterial({
  color: 0x888888,
  transparent: true,
  opacity: 0.4,
});
const geom = new THREE.TorusGeometry(10, 1.5, 16, 32);
const meleeMat = new THREE.MeshPhongMaterial({
  color: 0x1122ff,
  emissive: 0x1122ff,
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.4,
});

const playersSizeSelector = (state: MatchStore) =>
  state.getGameState()?.players.length || 0;

const DroidPlayers = () => {
  const { nodes, materials } = useGLTF(droidUrl) as any;
  const melee = useRef<THREE.InstancedMesh>(null);
  const life = useRef<THREE.InstancedMesh>(null);
  const marker = useRef<THREE.Mesh>(null);
  const mesh6 = useRef<THREE.InstancedMesh>(null);
  const mesh5 = useRef<THREE.InstancedMesh>(null);
  const mesh4 = useRef<THREE.InstancedMesh>(null);
  const body = useRef<THREE.InstancedMesh>(null);
  const metal = useRef<THREE.InstancedMesh>(null);
  const color = useRef<THREE.InstancedMesh>(null);
  const meshes = [mesh6, mesh5, mesh4, body, metal, color];
  const playersLength = useMatchStore(playersSizeSelector);

  useFrame(() => {
    const { getGameState, match, tick, followingPlayer } =
      useMatchStore.getState();
    const gameState = getGameState();
    if (!match) return;
    if (!match.players) return;
    if (!gameState) return;
    for (let i = 0; i < gameState.players.length; i++) {
      const player = gameState.players[i];
      const isAlive = player.health > 0;
      if (!isAlive) {
        tempPlayers.position.set(0, match.map.size[0] * 3, 0);
        tempPlayers.updateMatrix();
        tempLife.position.set(0, 5000, 0);
        tempLife.updateMatrix();
        life.current!.setMatrixAt(i, tempLife.matrix);
        life.current!.setColorAt(i, black);
        life.current!.instanceColor!.needsUpdate = true;
        tempMelee.position.set(0, 5000, 0);
        tempMelee.updateMatrix();
      } else {
        const [x, y] = player.pos;
        tempPlayers.position.set(x, 0, y);
        mapOffset.set(-match.map.size[0] / 2, 0, -match.map.size[1] / 2);
        tempPlayers.position.add(mapOffset);
        tempPlayers.rotation.set(0, Math.sin(tick / 10), 0);
        const color = match.players[player.id].color || [1, 1, 1];
        tempColor.setRGB(...color);
        tempPlayers.updateMatrix();
        tempLife.position.copy(tempPlayers.position).add(lifeOffset);
        tempLife.updateMatrix();
        life.current!.setMatrixAt(i, tempLife.matrix);
        tempLifeColor.lerpColors(
          new THREE.Color(0xff0000),
          new THREE.Color(0x00ff00),
          (player.health / 30) * (player.health / 30)
        );
        life.current!.setColorAt(i, tempLifeColor);
        life.current!.instanceMatrix.needsUpdate = true;
        life.current!.instanceColor!.needsUpdate = true;

        if (followingPlayer === player.id) {
          marker.current?.position.copy(tempPlayers.position).add(markerOffset);
        }
        if (followingPlayer === null) {
          marker.current?.position.set(0, 5000, 0);
        }
        if (player.usedSkill === Skill.MELEE) {
          tempMelee.rotation.set(Math.PI / 2, 0, 0);
          tempMelee.position.copy(tempPlayers.position).add(meleeOffset);
          tempMelee.updateMatrix();
          melee.current?.setMatrixAt(i, tempMelee.matrix);
          melee.current!.instanceMatrix.needsUpdate = true;
        } else {
          tempMelee.position.set(0, 5000, 0);
          tempMelee.updateMatrix();

          melee.current?.setMatrixAt(i, tempMelee.matrix);
          melee.current!.instanceMatrix.needsUpdate = true;
        }
      }
      for (const mesh of meshes) {
        if (!mesh.current) continue;
        mesh.current.setMatrixAt(i, tempPlayers.matrix);
        mesh.current.instanceMatrix.needsUpdate = true;
      }
      if (!metal.current) return;
      metal.current.instanceMatrix.needsUpdate = true;
      metal.current.setColorAt(i, tempColor);
    }
  });

  return (
    <group>
      <mesh ref={marker} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 100, 32]} />
        <meshPhongMaterial color={[1, 1, 1]} transparent opacity={0.5} />
      </mesh>
      <instancedMesh ref={melee} args={[geom, meleeMat, playersLength]} />
      <instancedMesh ref={life} args={[lifeGeom, lifeMat, playersLength]} />
      <instancedMesh
        ref={color}
        args={[nodes.Roundcube003.geometry, materials.COLOR, playersLength]}
      />
      <instancedMesh
        ref={metal}
        args={[nodes.Roundcube003_1.geometry, materials.metal, playersLength]}
      />
      <instancedMesh
        ref={body}
        args={[nodes.Roundcube003_2.geometry, materials.plastic, playersLength]}
      />
      <instancedMesh
        ref={mesh4}
        args={[nodes.Roundcube003_3.geometry, materials.GLOE, playersLength]}
      />
      <instancedMesh
        ref={mesh5}
        args={[nodes.Roundcube003_4.geometry, materials.logo, playersLength]}
      />
      <instancedMesh
        ref={mesh6}
        args={[nodes.Roundcube003_5.geometry, materials.LOGO, playersLength]}
      />
    </group>
  );
};

export { DroidPlayers };

useGLTF.preload(droidUrl);
