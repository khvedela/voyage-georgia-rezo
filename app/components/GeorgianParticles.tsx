"use client";

import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

type GeorgianParticle = {
    position: THREE.Vector3;
    letter: string;
    speed: number;
    orbit: number;
    phase: number;
};

type GeorgianParticlesProps = {
    count?: number;
    spread?: number;
};

// Georgian alphabet letters - using culturally significant ones
const GEORGIAN_LETTERS = [
    "ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ",
    "ლ", "მ", "ნ", "ო", "პ", "ჟ", "რ", "ს", "ტ", "უ",
    "ფ", "ქ", "ღ", "ყ", "შ", "ჩ", "ც", "ძ", "წ", "ჭ", "ხ", "ჯ", "ჰ"
];

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function GeorgianParticles({ count = 150, spread = 25 }: GeorgianParticlesProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Generate particle data
    const particles = useMemo<GeorgianParticle[]>(() => {
        const result: GeorgianParticle[] = [];

        for (let i = 0; i < count; i++) {
            // Circular distribution (wider spread)
            const radius = spread * Math.sqrt(seededRandom(i * 3));
            const theta = seededRandom(i * 5) * Math.PI * 2;

            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            const y = seededRandom(i * 7) * 15 + 2; // Higher altitude: 2-17

            result.push({
                position: new THREE.Vector3(x, y, z),
                letter: GEORGIAN_LETTERS[i % GEORGIAN_LETTERS.length],
                speed: 0.1 + seededRandom(i * 11) * 0.3,
                orbit: seededRandom(i * 13) * Math.PI * 2,
                phase: seededRandom(i * 17) * Math.PI * 2,
            });
        }

        return result;
    }, [count, spread]);

    // Animate particles with gentle drift
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        groupRef.current.children.forEach((child, i) => {
            const particle = particles[i];

            // Gentle floating motion (sine wave)
            const floatY = Math.sin(time * particle.speed + particle.phase) * 0.5;
            const orbitX = Math.cos(time * 0.1 + particle.orbit) * 0.3;
            const orbitZ = Math.sin(time * 0.1 + particle.orbit) * 0.3;

            child.position.set(
                particle.position.x + orbitX,
                particle.position.y + floatY,
                particle.position.z + orbitZ
            );

            // Gentle rotation
            child.rotation.y = time * 0.2 + particle.phase;
        });
    });

    return (
        <group ref={groupRef}>
            {particles.map((particle, i) => (
                <Text
                    key={i}
                    position={particle.position}
                    fontSize={0.6}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#34d399"
                    fillOpacity={0.4}
                    outlineOpacity={0.6}
                >
                    {particle.letter}
                </Text>
            ))}
        </group>
    );
}
