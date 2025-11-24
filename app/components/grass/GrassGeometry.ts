import * as THREE from "three";
import { seededRandom, interpolate } from "@/app/lib/math";
import { getTerrainHeight } from "@/app/lib/terrain";

// --- CONSTANTS ---
const BLADE_WIDTH = 0.15; 
const BLADE_HEIGHT = 1.0;
const BLADE_HEIGHT_VARIATION = 0.6;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function getTerrainNormal(x: number, z: number) {
  const epsilon = 0.1;
  const hL = getTerrainHeight(x - epsilon, z);
  const hR = getTerrainHeight(x + epsilon, z);
  const hD = getTerrainHeight(x, z - epsilon);
  const hU = getTerrainHeight(x, z + epsilon);

  const vX = new THREE.Vector3(2 * epsilon, hR - hL, 0);
  const vZ = new THREE.Vector3(0, hU - hD, 2 * epsilon);
  
  return new THREE.Vector3().crossVectors(vZ, vX).normalize();
}

function computeBlade(center: THREE.Vector3, normal: THREE.Vector3, index: number) {
  const height = BLADE_HEIGHT + seededRandom(index) * BLADE_HEIGHT_VARIATION;
  
  // 1. Orientation: Blend World Up with Terrain Normal
  // Pure Up = Artificial. Pure Normal = Flat on slopes.
  // Blend 50/50 for natural growth against gravity but respecting soil.
  const up = new THREE.Vector3(0, 1, 0);
  const mixedNormal = new THREE.Vector3().copy(up).lerp(normal, 0.5).normalize();
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, mixedNormal);
  
  // 2. Random Rotation around Y axis (Yaw)
  const randomAngle = seededRandom(index + 1) * Math.PI * 2;
  const yawRotation = new THREE.Quaternion().setFromAxisAngle(mixedNormal, randomAngle);
  quaternion.multiply(yawRotation);

  // 3. Bending Logic
  const bendAmount = seededRandom(index + 2) * 0.3; 
  
  const w2 = BLADE_WIDTH / 2;
  const h = height;
  
  const localVerts = [
    new THREE.Vector3(-w2, 0, 0),     
    new THREE.Vector3(w2, 0, 0),      
    new THREE.Vector3(-w2 * 0.5, h * 0.5, bendAmount * 0.5), 
    new THREE.Vector3(w2 * 0.5, h * 0.5, bendAmount * 0.5),  
    new THREE.Vector3(0, h, bendAmount)                      
  ];

  const vIndex = index * BLADE_VERTEX_COUNT;
  const positions: number[] = [];

  localVerts.forEach(v => {
    v.applyQuaternion(quaternion); 
    v.add(center); 
    positions.push(v.x, v.y, v.z);
  });

  return {
    positions,
    indices: [
      vIndex,
      vIndex + 1,
      vIndex + 2,
      vIndex + 2,
      vIndex + 4,
      vIndex + 3,
      vIndex + 3,
      vIndex,
      vIndex + 2,
    ],
  };
}

export function createGrassGeometry(count: number, size: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const vertIndices: number[] = [];

  for (let i = 0; i < count; i++) {
    const surfaceMin = (size / 2) * -1;
    const surfaceMax = size / 2;
    
    const radius = (size / 2) * Math.sqrt(seededRandom(i + 3));
    const theta = seededRandom(i + 4) * 2 * Math.PI;

    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = getTerrainHeight(x, z);
    
    const pos = new THREE.Vector3(x, y, z);
    const normal = getTerrainNormal(x, z);

    const u = interpolate(x, surfaceMin, surfaceMax, 0, 1);
    const v = interpolate(z, surfaceMin, surfaceMax, 0, 1);

    for (let j = 0; j < BLADE_VERTEX_COUNT; j++) {
      uvs.push(u, v);
      vertIndices.push(j); 
    }

    const blade = computeBlade(pos, normal, i);
    positions.push(...blade.positions);
    indices.push(...blade.indices);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute(
    "vertIndex",
    new THREE.Float32BufferAttribute(vertIndices, 1)
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}