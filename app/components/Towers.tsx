"use client";

import * as THREE from "three";
import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

type TowerProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

function Tower({ position, rotation = [0, 0, 0], scale = 0.72 }: TowerProps) {
  // Keep towers completely static — no drop/wobble — they are simply placed on the terrain.
  // Default scale is reduced: previously we used a larger value (8 in earlier calls), reduce by ~70% -> ~2.4

  // load and clone tower model locally (useGLTF is cached, so this is cheap)
  const { scene: towerScene } = useGLTF("/tower.glb");
  const groupRef = React.useRef<THREE.Group | null>(null);

  // clone scene so instances can be placed independently
  const clonedScene = useMemo(() => {
    const c = towerScene.clone(true);

    // Improve materials for every mesh inside the tower so it reads better in the scene.
    // We convert existing materials to MeshStandardMaterial variants, keep maps where available,
    // and enable shadows on meshes.
    c.traverse((obj: THREE.Object3D) => {
      // guard to treat only meshes
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const oldMat = mesh.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;

        // Helper to convert legacy material into a PBR-ready material while keeping maps
        type MaterialLike = {
          color?: THREE.Color;
          map?: THREE.Texture | null;
          normalMap?: THREE.Texture | null;
          emissive?: THREE.Color;
          roughness?: number;
          metalness?: number;
          needsUpdate?: boolean;
        };

        const makeStandard = (m: THREE.Material | undefined | null) => {
          // use safe narrowing to access possibly-present properties
          const src = m as unknown as MaterialLike;
          const mat = new THREE.MeshPhysicalMaterial({
            // colder / neutral stone-like color for a serious mountain mood
            color: src?.color ? src.color.clone() : new THREE.Color(0x6e7276),
            map: src?.map ?? null,
            normalMap: src?.normalMap ?? null,
            roughness: 0.55,
            metalness: 0.06,
            clearcoat: 0.02,
            clearcoatRoughness: 0.4,
            envMapIntensity: 0.7,
          });
          // Add a tiny warm emissive to make sunset highlights pop when lit
          if (src?.emissive) mat.emissive = src.emissive.clone();
          else mat.emissive = new THREE.Color(0x2a0b00);
          mat.emissiveIntensity = 0.06;
          return mat;
        };

        if (Array.isArray(oldMat)) {
          mesh.material = oldMat.map((m) => makeStandard(m));
        } else if (oldMat) {
          mesh.material = makeStandard(oldMat);
        }

        // small tweaks per mesh for micro variation
        if (!Array.isArray(mesh.material)) {
          const matAny = mesh.material as unknown as MaterialLike;
          matAny.roughness = matAny.roughness ?? 0.45;
          matAny.metalness = matAny.metalness ?? 0.12;
          matAny.needsUpdate = true;
        }
      }
    });

    return c;
  }, [towerScene]);

  // Attach the cloned GLTF to the group in useEffect to avoid serializing the object in props
  React.useEffect(() => {
    const g = groupRef.current;
    if (g && clonedScene) {
      g.add(clonedScene);
      return () => {
        g.remove(clonedScene);
      };
    }
    return undefined;
  }, [clonedScene]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    >
      {/* Main tower model is attached in useEffect */}

      {/* Warm sunset rim light to add separation and warmth */}
      <pointLight
        intensity={0.16}
        distance={9}
        color="#ffd6a6"
        castShadow={false}
      />

      {/* Soft contact shadow so towers feel grounded without heavy rendering cost */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        scale={[2.2, 2.2, 2.2]}
      >
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.14}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export function Towers() {
  // spawn instances — each Tower will load and clone the model locally (useGLTF caches it)

  // Four towers arranged around the scene to sit on the grass (static placement)
  // Place all four towers around the center so they are visible when the camera pans back.
  // These positions keep them in a neat square around the origin and visible to the starting camera angle.
  const targets: {
    pos: [number, number, number];
    rot: [number, number, number];
  }[] = [
    { pos: [-10.5, 0.1, -6.0], rot: [0, Math.PI * -0.05, 0] },
    { pos: [10.5, 0.1, -6.0], rot: [0, Math.PI * 0.05, 0] },
    { pos: [-10.5, 0.1, 6.0], rot: [0, Math.PI * 0.25, 0] },
    { pos: [10.5, 0.1, 6.0], rot: [0, Math.PI * -0.25, 0] },
  ];

  return (
    <>
      {targets.map((t, i) => (
        <Tower key={i} position={t.pos} rotation={t.rot} />
      ))}
    </>
  );
}

useGLTF.preload("/tower.glb");
