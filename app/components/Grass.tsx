"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import "./grass/GrassMaterial";
import { createGrassGeometry } from "./grass/GrassGeometry";

type GrassProps = {
  count?: number;
  size?: number;
};

export function Grass({ count = 100000, size = 30 }: GrassProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudTextureRaw = useLoader(TextureLoader, "/cloud.jpg");

  // Clone texture to safely modify properties without affecting cache or linting rules
  const cloudTexture = useMemo(() => {
    const t = cloudTextureRaw.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [cloudTextureRaw]);

  // Generate geometry once
  const geometry = useMemo(() => {
    return createGrassGeometry(count, size);
  }, [count, size]);

  // Animate uniforms
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
         material.uniforms.uTime.value = state.clock.elapsedTime * 1000;
      }
    }
  });

  return (
    <group>
      <mesh geometry={geometry} ref={meshRef}>
        <grassMaterial
          uCloud={cloudTexture}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <circleGeometry args={[15, 32]} />
        <grassMaterial
          uCloud={cloudTexture}
          side={THREE.DoubleSide}
          uTime={0} 
        />
      </mesh>
    </group>
  );
}