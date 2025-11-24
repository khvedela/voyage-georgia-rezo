"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import "./grass/GrassMaterial";
import { createGrassGeometry } from "./grass/GrassGeometry";
import { subscribeToImpacts } from "@/app/lib/impact";
import { createGroundGeometry } from "./grass/GroundGeometry";

type GrassProps = {
  count?: number;
  size?: number;
};

export function Grass({ count = 300000, size = 60 }: GrassProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mirrorRef = useRef<THREE.Mesh>(null!);
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
    if (mirrorRef.current) {
      const material = mirrorRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) material.uniforms.uTime.value = time;
    }
    if (floorRef.current) {
      const material = floorRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) material.uniforms.uTime.value = time;
    }
  });

  // Setup impact subscription once: fill uImpacts when an impact is emitted
  React.useEffect(() => {
    const MAX = 6;
    // store vector4s in a local circular buffer
    const impacts: THREE.Vector4[] = new Array(MAX)
      .fill(0)
      .map(() => new THREE.Vector4(0, 0, 0, 0));
    let nextIndex = 0;

    const unsub = subscribeToImpacts((impact) => {
      const vec = new THREE.Vector4(
        impact.x,
        impact.z,
        impact.start,
        impact.strength
      );

      impacts[nextIndex] = vec;

      // push into both grass and floor materials (if they exist)
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        if (mat.uniforms && mat.uniforms.uImpacts)
          mat.uniforms.uImpacts.value = impacts;
      }
      if (mirrorRef.current) {
        const mat = mirrorRef.current.material as THREE.ShaderMaterial;
        if (mat.uniforms && mat.uniforms.uImpacts)
          mat.uniforms.uImpacts.value = impacts;
      }
      if (floorRef.current) {
        const mat = floorRef.current.material as THREE.ShaderMaterial;
        if (mat.uniforms && mat.uniforms.uImpacts)
          mat.uniforms.uImpacts.value = impacts;
      }

      nextIndex = (nextIndex + 1) % MAX;
    });

    return () => unsub();
  }, []);

  return (
    <group>
      {/* Top-facing grass — renders as usual */}
      <mesh geometry={geometry} ref={meshRef} castShadow>
        <grassMaterial
          uCloud={cloudTexture}
          side={THREE.DoubleSide}
          uMirror={0}
          uSunColor={new THREE.Color(0xffb86b)}
        />
      </mesh>

      {/* Mirrored bottom-facing grass rendered from the same buffers —
          set uMirror=1 to flip vertices around each blade's center in the shader.
          To avoid double shadow artefacts on the ground, this copy does not cast
          shadows (it still receives lighting via the shader). */}
      <mesh geometry={geometry} ref={mirrorRef} receiveShadow>
        <grassMaterial
          uCloud={cloudTexture}
          side={THREE.DoubleSide}
          uMirror={1}
          uSunColor={new THREE.Color(0xffb86b)}
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
          uSunColor={new THREE.Color(0xffb86b)}
        />
      </mesh>
    </group>
  );
}
