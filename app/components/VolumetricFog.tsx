"use client";

import * as THREE from "three";
import { useMemo } from "react";

// Enhanced volumetric fog shader
const volumetricFogMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Base fog color (warmer, dusk blue) — blends to sunset orange
    fogColor: { value: new THREE.Color("#1a1620") },
    fogNear: { value: 6 },
    fogFar: { value: 42 },
    // Slightly denser fog to add distance atmosphere while preserving foreground detail
    fogDensity: { value: 0.12 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    uniform float fogDensity;
    
    varying vec3 vWorldPosition;
    
    void main() {
      float depth = length(vWorldPosition - cameraPosition);
      float fogFactor = smoothstep(fogNear, fogFar, depth);
      
      // Add some variation based on height (Y position)
      float heightFog = smoothstep(0.0, 10.0, vWorldPosition.y) * 0.3;
      fogFactor = mix(fogFactor, fogFactor * (1.0 - heightFog), 0.5);
      
      // Mix towards a warm sunset tint (orange) for mid to far distances
      vec3 sunsetWarm = vec3(0.98, 0.58, 0.28);
      float warmFactor = smoothstep(0.0, 1.0, fogFactor * 0.85);
      vec3 mixed = mix(fogColor, sunsetWarm, warmFactor * 0.62);

      // Slightly accentuate mid-distance so silhouettes read and show warm haze
      float alpha = fogFactor * fogDensity;
      gl_FragColor = vec4(mixed, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
  side: THREE.BackSide,
});

export function VolumetricFog() {
  const geometry = useMemo(() => {
    // Large sphere that encompasses the scene
    return new THREE.SphereGeometry(50, 32, 32);
  }, []);

  return (
    <mesh
      geometry={geometry}
      material={volumetricFogMaterial}
      position={[0, 5, 0]}
    />
  );
}
