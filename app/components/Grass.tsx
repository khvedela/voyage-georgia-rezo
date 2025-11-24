"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import "./grass/GrassMaterial";
import { createGrassGeometry } from "./grass/GrassGeometry";
import { createGroundGeometry } from "./grass/GroundGeometry";

type GrassProps = {
  count?: number;
  size?: number;
};

export function Grass({ count = 300000, size = 60 }: GrassProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const floorRef = useRef<THREE.Mesh>(null!);
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

  // Generate procedural ground geometry that matches terrain
  const groundGeometry = useMemo(() => {
    return createGroundGeometry(size, 64); // Higher segments for smoother terrain
  }, [size]);

  // Animate uniforms
  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) material.uniforms.uTime.value = time;
    }
    if (floorRef.current) {
        const material = floorRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms) material.uniforms.uTime.value = time;
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
      {/* Procedural Ground Mesh */}
      <mesh
        ref={floorRef}
        geometry={groundGeometry}
        position={[0, -0.05, 0]} // Slight offset to avoid z-fighting at base
        receiveShadow
      >
        <grassMaterial
          uCloud={cloudTexture}
          side={THREE.DoubleSide}
          uTime={0} 
        />
      </mesh>
    </group>
  );
}