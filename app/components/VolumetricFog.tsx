"use client";

import * as THREE from "three";
import { useMemo } from "react";

// Enhanced volumetric fog shader
const volumetricFogMaterial = new THREE.ShaderMaterial({
    uniforms: {
        fogColor: { value: new THREE.Color("#050a10") },
        fogNear: { value: 5 },
        fogFar: { value: 40 },
        fogDensity: { value: 0.08 },
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
      
      // Subtle emerald tint in the distance
      vec3 emeraldTint = mix(fogColor, vec3(0.2, 0.6, 0.5), fogFactor * 0.15);
      
      gl_FragColor = vec4(emeraldTint, fogFactor * fogDensity);
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
        <mesh geometry={geometry} material={volumetricFogMaterial} position={[0, 5, 0]} />
    );
}
