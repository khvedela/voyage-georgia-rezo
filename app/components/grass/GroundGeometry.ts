import * as THREE from "three";
import { getTerrainHeight } from "@/app/lib/terrain";

export function createGroundGeometry(size: number, segments: number) {
  // Use PlaneGeometry as base for grid
  // We will deform it to match the terrain
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  
  // Rotate to XZ plane
  geometry.rotateX(-Math.PI / 2);

  const posAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // We want a circular mask essentially, or just a square terrain?
  // User asked for "plane 2x bigger", usually implies extending the world.
  // Grass is distributed in a circle (radius = size/2).
  // If we use a square plane of width `size`, the corners will stick out past the grass circle.
  // We can just drop the height of vertices outside the radius to -infinity or mask them.
  // Or simpler: Just render the square terrain. It usually looks fine if it fades into fog.
  // But to match the "island" look if desired, we can lower outside vertices.
  // Let's just deform the grid for now.

  for (let i = 0; i < posAttribute.count; i++) {
    vertex.fromBufferAttribute(posAttribute, i);
    
    // vertex.x and vertex.z are world coords (centered at 0)
    const y = getTerrainHeight(vertex.x, vertex.z);
    
    // Optional: Taper edges to 0 or -something?
    // No, user wants "rolling hills".
    
    // Apply height
    // We lower it slightly (-0.1) to ensure it's just below the grass roots
    // to avoid z-fighting with the bottom of the blade if it sits exactly at 0 offset
    posAttribute.setY(i, y - 0.05);
  }

  geometry.computeVertexNormals();
  return geometry;
}
