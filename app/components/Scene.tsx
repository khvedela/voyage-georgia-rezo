"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ScrollControls,
  Scroll,
  Sky,
} from "@react-three/drei";
import { Grass } from "./Grass";
import { Swords } from "./Swords";
import { Towers } from "./Towers";
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
    const _state = state as unknown as { controls?: { scrollOffset?: number } };
    const scrollData = _state.controls?.scrollOffset;
    const scroll = typeof scrollData === "number" ? scrollData : 0;

    // Camera movement based on scroll (updated base y/z so more of the scene is visible)
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      -7 + scroll * 5,
      0.1
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      8 - scroll * 3,
      0.1
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      20 - scroll * 8,
      0.1
    );
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
      {/* Sunset sky: lower sun position and warmer sky tones */}
      <Sky
        sunPosition={[30, 6, -40]}
        // slightly lower turbidity and scattering so the sky/sun is less intense
        turbidity={9}
        rayleigh={0.6}
        mieCoefficient={0.01}
        mieDirectionalG={0.8}
      />
      <fog attach="fog" args={["#050a10", 5, 40]} />
      <VolumetricFog />

      {/* Magical Atmosphere - Georgian Cultural Particles */}
      <GeorgianParticles count={150} spread={25} />
      <Atmosphere />

      {/* Lighting */}

      {/* Warm sunset lighting — reduced intensities to avoid over-exposure */}
      <ambientLight intensity={0.06} color="#ffe2b0" />
      <directionalLight
        position={[40, 20, -10]}
        intensity={0.45}
        color="#ffad5c"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Subtle sun fill for gentle highlights */}
      <pointLight
        position={[32, 18, -18]}
        intensity={0.12}
        distance={80}
        color="#ffb97a"
      />

      <ScrollControls pages={8} damping={0.3}>
        <Scroll>
          {/* <SoundscapeEngine enabled={audioEnabled} /> */}
          <Grass count={150000} />
          <Towers />
          <Swords />
          <SwordReflections />
          <CameraRig />
          <PostProcessing />
        </Scroll>

        <Scroll html style={{ width: "100%", height: "100%" }}>
          {children}
        </Scroll>
      </ScrollControls>

      {/* Use smooth adaptive DPR and enable antialiasing in WebGL for crisper rendering */}
      <AdaptiveDpr />
      <AdaptiveEvents />
    </>
  );
}

export default function Scene({ children }: SceneProps) {
  // Use useMemo to create stable references for Canvas props
  // Pan back and slightly up so a wider scene is visible and multiple towers fit in the frame
  const cameraConfig = useMemo(
    () => ({ position: [-7, 8, 20] as [number, number, number], fov: 65 }),
    []
  );
  const glConfig = useMemo(
    () => ({
      antialias: true,
      powerPreference: "high-performance" as const,
      toneMapping: 3,
      // lower renderer exposure to reduce overall scene brightness/exposure
      toneMappingExposure: 0.65,
    }),
    []
  );

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
