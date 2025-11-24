import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./GrassShaders";

export const GrassMaterial = shaderMaterial(
  {
    uTime: 0,
    uCloud: null,
    uMirror: 0,
    // up to 6 simultaneous impacts: (x, z, startMs, strength)
    uImpacts: [
      new THREE.Vector4(0, 0, 0, 0),
      new THREE.Vector4(0, 0, 0, 0),
      new THREE.Vector4(0, 0, 0, 0),
      new THREE.Vector4(0, 0, 0, 0),
      new THREE.Vector4(0, 0, 0, 0),
      new THREE.Vector4(0, 0, 0, 0),
    ],
    uImpactLife: 2.5,
    uSunColor: new THREE.Color(0xffb86b),
  },
  vertexShader,
  fragmentShader
);

extend({ GrassMaterial });

// Declare the custom element for TypeScript
declare module "@react-three/fiber" {
  interface ThreeElements {
    // Using any to avoid type export issues with Object3DNode in newer R3F versions
    grassMaterial: any;
  }
}

