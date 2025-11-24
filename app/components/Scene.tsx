"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, ScrollControls, Scroll, Sky } from "@react-three/drei";
import { Grass } from "./Grass";
import { Swords } from "./Swords";
import { Atmosphere } from "./Atmosphere";
import { GeorgianParticles } from "./GeorgianParticles";
// import { SoundscapeEngine } from "./SoundscapeEngine"; // DISABLED: Tone.js creates circular refs incompatible with Next.js
import { PostProcessing } from "./postprocessing/PostProcessing";
import { SwordReflections } from "./SwordReflections";
import { VolumetricFog } from "./VolumetricFog";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

function CameraRig() {
  useFrame((state) => {
    // Safely access scroll data without circular reference
    const scrollData = (state as any).controls?.scrollOffset;
    const scroll = typeof scrollData === 'number' ? scrollData : 0;

    // Camera movement based on scroll
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, -7 + scroll * 5, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 6 - scroll * 3, 0.1);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 10 - scroll * 8, 0.1);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

type SceneProps = {
  children: React.ReactNode;
};

function SceneContent({ children }: SceneProps) {
  return (
    <>
      {/* Cinematic Sky with Enhanced Volumetric Fog */}
      <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#050a10", 5, 40]} />
      <VolumetricFog />

      {/* Magical Atmosphere - Georgian Cultural Particles */}
      <GeorgianParticles count={150} spread={25} />
      <Atmosphere />

      {/* Lighting */}
      <ambientLight intensity={0.3} color="#b0c0e0" />
      <directionalLight
        position={[-10, 20, 5]}
        intensity={2.5}
        color="#d0e0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <ScrollControls pages={2} damping={0.3}>
        <Scroll>
          {/* <SoundscapeEngine enabled={audioEnabled} /> */}
          <Grass count={150000} />
          <Swords />
          <SwordReflections />
          <CameraRig />
          <PostProcessing />
        </Scroll>

        <Scroll html style={{ width: '100%', height: '100%' }}>
          {children}
        </Scroll>
      </ScrollControls>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

export default function Scene({ children }: SceneProps) {
  // Use useMemo to create stable references for Canvas props
  const cameraConfig = useMemo(() => ({ position: [-7, 6, 10] as [number, number, number], fov: 65 }), []);
  const glConfig = useMemo(() => ({
    antialias: false,
    powerPreference: "high-performance" as const,
    toneMapping: 3,
  }), []);

  return (
    <Canvas
      camera={cameraConfig}
      className="bg-neutral-950"
      shadows
      dpr={[1, 2]}
      gl={glConfig}
    >
      <Suspense fallback={null}>
        <SceneContent>{children}</SceneContent>
      </Suspense>
    </Canvas>
  );
}