import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, ReactThreeFiber } from "@react-three/fiber";
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
    grassMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial> & {
      uTime?: number;
      uCloud?: THREE.Texture | null;
    };
  }
}
