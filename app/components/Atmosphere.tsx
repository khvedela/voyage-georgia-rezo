"use client";

import * as THREE from "three";
import React from "react";
import { Cloud, Clouds } from "@react-three/drei";

export function Atmosphere() {
  return (
    <group position={[0, 2, 0]}>
      {/* Low lying drifting fog/clouds */}
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud
          seed={1}
          scale={2}
          volume={5}
          color="#c0d0e0"
          fade={10}
          growth={4}
          speed={0.1} // Slow drift
          position={[-10, 0, -10]}
          opacity={0.3}
          bounds={[10, 2, 10]}
        />
        <Cloud
          seed={2}
          scale={2}
          volume={5}
          color="#c0d0e0"
          fade={10}
          growth={4}
          speed={0.1}
          position={[10, 0, 10]}
          opacity={0.3}
          bounds={[10, 2, 10]}
        />
        <Cloud
          seed={3}
          scale={2}
          volume={5}
          color="#c0d0e0"
          fade={10}
          growth={4}
          speed={0.1}
          position={[0, 0, 0]} // Center
          opacity={0.2}
          bounds={[15, 2, 15]}
        />
      </Clouds>
    </group>
  );
}
