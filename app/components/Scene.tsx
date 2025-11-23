"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Grass } from "./Grass";
import { Swords } from "./Swords";
import { Suspense } from "react";

function SceneContent() {
  return (
    <>
      {/* Atmospheric Fog */}
      <fog attach="fog" args={["#050705", 5, 25]} />

      {/* Lighting */}
      <ambientLight intensity={0.1} color="#c0d0e0" />
      <directionalLight
        position={[-10, 10, 5]}
        intensity={3}
        color="#d0e0ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Environment preset="forest" blur={0.8} />

      {/* The Grass (Includes its own floor) */}
      <Grass count={100000} />

      {/* The Falling Swords */}
      <Swords />

      <OrbitControls
        maxPolarAngle={Math.PI / 2.2}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        enableZoom={false}
        enablePan={false}
      />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [-7, 3, 7], fov: 75 }}
      className="bg-neutral-950"
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: 3, // ACESFilmicToneMapping
      }}
    >
      <color attach="background" args={["#050705"]} />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
