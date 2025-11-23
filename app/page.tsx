"use client";

import dynamic from "next/dynamic";

// Dynamically import the Scene component
// ssr: false is mandatory for Three.js
const Scene = dynamic(() => import("./components/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-900 text-white">
      Loading 3D Scene...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* The 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* UI Overlay Layer (Example) */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-start pt-20">
        <h1 className="text-5xl font-bold text-white drop-shadow-md">
          DIDGORI
        </h1>
        <p className="mt-2 text-zinc-300">Legendary Tours</p>
      </div>
    </main>
  );
}
