import * as THREE from "three";
import { seededRandom, interpolate } from "@/app/lib/math";

// --- CONSTANTS ---
const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 0.8;
const BLADE_HEIGHT_VARIATION = 0.6;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function computeBlade(center: [number, number, number], index: number) {
  // Use seeded random values for determinism
  const height = BLADE_HEIGHT + seededRandom(index) * BLADE_HEIGHT_VARIATION;
  const vIndex = index * BLADE_VERTEX_COUNT;

  // Randomize blade orientation and tip angle using deterministic randoms
  const yaw = seededRandom(index + 1) * Math.PI * 2;
  const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)];
  const bend = seededRandom(index + 2) * Math.PI * 2;
  const bendVec = [Math.sin(bend), 0, -Math.cos(bend)];

  // Calc bottom, middle, and tip vertices
  const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i]);
  const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i]);
  const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i]);
  const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i]);
  const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i]);

  // Attenuate height
  tl[1] += height / 2;
  tr[1] += height / 2;
  tc[1] += height;

  return {
    positions: [...bl, ...br, ...tr, ...tl, ...tc],
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
    
    // Use seeded randoms for deterministic generation
    const radius = (size / 2) * seededRandom(i + 3);
    const theta = seededRandom(i + 4) * 2 * Math.PI;

    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);

    const u = interpolate(x, surfaceMin, surfaceMax, 0, 1);
    const v = interpolate(y, surfaceMin, surfaceMax, 0, 1);

    for (let j = 0; j < BLADE_VERTEX_COUNT; j++) {
      uvs.push(u, v);
      vertIndices.push(j); // 0, 1, 2, 3, 4
    }

    const blade = computeBlade([x, 0, y], i);
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
