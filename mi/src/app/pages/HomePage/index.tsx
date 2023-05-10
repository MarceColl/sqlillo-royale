import { Routes } from "@/app/constants";
import { useAuth } from "@/app/hooks";
import { Link } from "@/modules/Router";
import { Main } from "@/app/ui";
import droidUrl from "@/app/assets/DROID.glb?url";

import * as S from "./styled";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, useGLTF } from "@react-three/drei";
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
  return (
    <Main>
      <Canvas camera={{ position: [20, 10, 0], fov: 50 }}>
        <ambientLight intensity={0.5} />
	<Model position={[0, 0.25, 0]} />
	<Environment preset="city" />
	<ContactShadows frames={1} scale={5} position={[0, -1, 0]} far={1} blur={5} opacity={0.5} color="#204080" />
      <OrbitControls autoRotate={true} autoRotateSpeed={5.0}/>
      </Canvas>
      <S.Menu>
        <Link to={Routes.editor}>
          <S.Button>Code</S.Button>
        </Link>
        <Link to={Routes.matchList}>
          <S.Button>Matches</S.Button>
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
