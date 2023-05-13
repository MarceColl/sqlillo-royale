import { useQuery } from "react-query";

import { Queries, Routes } from "@/app/constants";
import * as API from "@/app/API";
import { useAuth } from "@/app/hooks";
import { Link } from "@/modules/Router";
import { Main } from "@/app/ui";
import droidUrl from "@/app/assets/DROID.glb?url";

import domeVS from "@/app/shaders/dome.vs";
import domeFS from "@/app/shaders/dome.fs";

import * as S from "./styled";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  useGLTF,
  Float,
  Grid,
} from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

type Props = {
  position: any;
};

const Model = (props: Props) => {
  const { nodes, materials } = useGLTF(droidUrl) as any;
  const mesh6 = useRef<THREE.InstancedMesh>(null);
  const mesh5 = useRef<THREE.InstancedMesh>(null);
  const mesh4 = useRef<THREE.InstancedMesh>(null);
  const body = useRef<THREE.InstancedMesh>(null);
  const metal = useRef<THREE.InstancedMesh>(null);
  const color = useRef<THREE.InstancedMesh>(null);

  return (
    <group {...props}>
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

const HomePage = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
  };

  const { data } = useQuery([Queries.userInfo], API.getUserInfo);
  const username = data?.username || "...";
  const ranking = data?.ranking;

  return (
    <Main>
      <Canvas camera={{ position: [20, 10, 0], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <Float
          speed={6}
          rotationIntensity={0.3}
          floatIntensity={0.5}
          floatingRange={[0.5, 4]}
        >
          <Model position={[0, 3, 0]} />
        </Float>
        <Environment preset="city" />
        <ContactShadows
          frames={1}
          scale={10}
          position={[0, -1, 0]}
          far={8}
          blur={8}
          opacity={0.3}
          color="#6a80ab"
        />
        <mesh>
          <sphereGeometry args={[200, 32, 32]} />
          <shaderMaterial
            attach="material"
            vertexShader={domeVS}
            fragmentShader={domeFS}
            side={THREE.DoubleSide}
          />
        </mesh>
        <OrbitControls autoRotateSpeed={3} target={[0, 5, 0]} />
        <Grid
          cellColor="#666"
          sectionColor="#444"
          sectionSize={10}
          cellSize={5}
          args={[20, 20]}
          fadeDistance={100}
        />
      </Canvas>
      <S.UserInfo>
        Hi, <S.Username>{username}</S.Username>
        {ranking && (
          <S.Ranking $ranking={ranking}>#{ranking}</S.Ranking>
        )}
      </S.UserInfo>
      <S.Menu>
        <Link to={Routes.editor}>
          <S.Button>Code</S.Button>
        </Link>
        <Link to={Routes.matchList}>
          <S.Button>Matches</S.Button>
        </Link>
        <Link to={Routes.tracePlayer}>
          <S.Button>Play trace file</S.Button>
        </Link>
        <Link to={Routes.ranking}>
          <S.Button>Ranking</S.Button>
        </Link>
        <S.Button onClick={handleLogout}>Logout</S.Button>
      </S.Menu>
    </Main>
  );
};

export { HomePage };
