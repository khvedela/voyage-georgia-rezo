"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

type SwordReflection = {
    position: [number, number, number];
};

export function SwordReflections() {
    // Match sword positions from Swords.tsx (Y offset down for reflections)
    const reflectionPositions: SwordReflection[] = [
        { position: [0, -0.1, 0] },
        { position: [-12, -0.1, 8] },
        { position: [10, -0.1, -10] },
        { position: [-8, -0.1, -12] },
        { position: [14, -0.1, 12] },
    ];

    return (
        <group>
            {reflectionPositions.map((reflection, i) => (
                <mesh
                    key={i}
                    position={reflection.position}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[6, 6]} />
                    <MeshReflectorMaterial
                        blur={[300, 100]}
                        resolution={512}
                        mixBlur={1}
                        mixStrength={0.4}
                        roughness={1}
                        depthScale={1.2}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color="#0a1520"
                        metalness={0.5}
                        mirror={0.6}
                    />
                </mesh>
            ))}
        </group>
    );
}
