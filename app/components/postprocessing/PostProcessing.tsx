"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  ChromaticAberration,
  Bloom,
  DepthOfField,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
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
    const currentScroll = typeof scrollData === "number" ? scrollData : 0;

    const delta = currentScroll - prevScrollRef.current;

    // Calculate scroll velocity (smoothed)
    velocityRef.current = THREE.MathUtils.lerp(
      velocityRef.current,
      Math.abs(delta),
      0.1
    );

    // Apply chromatic aberration based on velocity
    if (chromaticAberrationRef.current) {
      const maxOffset = 0.003; // Maximum RGB split
      const offset = velocityRef.current * maxOffset * 50; // Scale up velocity

      // Update the chromatic aberration offset.
      // The ChromaticAberration component may expose either a THREE.Vector2-like object
      // with a set() method or a plain array. Handle both safely to avoid runtime errors.
      const off = chromaticAberrationRef.current.offset;
      if (off && typeof off.set === "function") {
        off.set(offset, offset);
      } else if (Array.isArray(off)) {
        off[0] = offset;
        off[1] = offset;
      } else {
        // Fallback: replace the offset with a simple array
        chromaticAberrationRef.current.offset = [offset, offset];
      }
    }

    prevScrollRef.current = currentScroll;
  });

  return (
    <EffectComposer>
      {/* Anti-aliasing pass (SMAA) for cleaner edges */}
      <SMAA />

      {/* Bloom - subtle brightening of highlights */}
      <Bloom
        luminanceThreshold={0.88}
        luminanceSmoothing={0.22}
        intensity={0.28} // further reduced for gentle sunset glow
        height={300}
      />

      {/* Depth of field - reduce bloom and DOF blur to make the look sharper/serious */}
      {/* Less bokehScale -> less blur; slightly tighter focalLength and focusDistance for subtle separation */}
      <DepthOfField focusDistance={0.02} focalLength={0.01} bokehScale={0.9} />

      {/* Chromatic aberration - kept subtle and dynamic */}
      <ChromaticAberration
        ref={chromaticAberrationRef}
        blendFunction={BlendFunction.NORMAL}
        offset={[0.001, 0.001]}
      />

      {/* Soft vignette to draw attention to the center — kept subtle for a serious mood */}
      <Vignette eskil={false} offset={0.45} darkness={0.18} />
    </EffectComposer>
  );
}
