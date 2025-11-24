import { createNoise2D } from "simplex-noise";

// Initialize Noise Globally to ensure consistency
const noise2D = createNoise2D(); 

export function getTerrainHeight(x: number, z: number) {
  const scale = 0.02; // Gentler, larger rolling hills
  const heightMultiplier = 3.0; 
  return noise2D(x * scale, z * scale) * heightMultiplier;
}
