import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./GrassShaders";

export const GrassMaterial = shaderMaterial(
  {
    uTime: 0,
    uCloud: null,
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

