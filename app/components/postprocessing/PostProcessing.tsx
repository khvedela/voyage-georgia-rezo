"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function PostProcessing() {
    const chromaticAberrationRef = useRef<any>(null);
    const prevScrollRef = useRef(0);
    const velocityRef = useRef(0);

    useFrame((state) => {
        // Safely get scroll without circular reference
        // Access scroll data from state if available
        const scrollData = (state as any).controls?.scrollOffset;
        const currentScroll = typeof scrollData === 'number' ? scrollData : 0;

        const delta = currentScroll - prevScrollRef.current;

        // Calculate scroll velocity (smoothed)
        velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, Math.abs(delta), 0.1);

        // Apply chromatic aberration based on velocity
        if (chromaticAberrationRef.current) {
            const maxOffset = 0.003; // Maximum RGB split
            const offset = velocityRef.current * maxOffset * 50; // Scale up velocity

            // Update the chromatic aberration offset
            chromaticAberrationRef.current.offset.set(offset, offset);
        }

        prevScrollRef.current = currentScroll;
    });

    return (
        <EffectComposer>
            <ChromaticAberration
                ref={chromaticAberrationRef}
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.001, 0.001)} // Initial subtle offset
            />
        </EffectComposer>
    );
}
