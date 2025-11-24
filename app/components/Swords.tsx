"use client";

import * as THREE from "three";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { emitImpact } from "@/app/lib/impact";

type SwordProps = {
  position: [number, number, number];
  delay: number;
  rotation?: [number, number, number];
};

function Sword({ position, delay, rotation = [0, 0, 0] }: SwordProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const [landed, setLanded] = useState(false);

  // Animation state for impact wobble
  const impactTime = useRef(0);
  const wobbleAxis = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    wobbleAxis.current = new THREE.Vector3(
      Math.random() - 0.5,
      0,
      Math.random() - 0.5
    ).normalize();
  }, []);

  // Load and clone GLTF inside the component so we don't pass circular objects through props
  const { scene: swordScene } = useGLTF("/sword.glb");
  const clonedScene = useMemo(() => swordScene.clone(true), [swordScene]);

  // Attach the cloned scene to the group without passing the object directly as a JSX prop
  useEffect(() => {
    const g = groupRef.current;
    if (g && clonedScene) {
      g.add(clonedScene);
      return () => {
        g.remove(clonedScene);
      };
    }
    return undefined;
  }, [clonedScene]);

  // Start high up
  const dropHeight = 60;
  const targetY = position[1];
  const startY = targetY + dropHeight;
  const gravity = 40; // Slower, heavier visual gravity

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    const activeTime = t - delay;

    if (activeTime < 0) {
      // Hover before drop
      groupRef.current.position.set(position[0], startY, position[2]);
    } else if (!landed) {
      // Physics Drop: y = y0 - 0.5 * g * t^2
      const currentY = startY - 0.5 * gravity * (activeTime * activeTime);

      if (currentY <= targetY) {
        setLanded(true);
        impactTime.current = t;

        // Snap to ground
        groupRef.current.position.set(position[0], targetY, position[2]);

        // Emit a ground impact event so the terrain and grass can react
        emitImpact(position[0], position[2], 1.0);

        // Add initial random tilt for variety (permanent)
        groupRef.current.rotation.x += (Math.random() - 0.5) * 0.1;
        groupRef.current.rotation.z += (Math.random() - 0.5) * 0.1;
      } else {
        groupRef.current.position.set(position[0], currentY, position[2]);
      }
    } else {
      // Post-impact wobble (damped sine wave)
      const timeSinceImpact = t - impactTime.current;
      if (timeSinceImpact < 1.5) {
        const frequency = 15;
        const damping = 3.0;
        const amplitude =
          0.1 *
          Math.exp(-damping * timeSinceImpact) *
          Math.sin(frequency * timeSinceImpact);

        // Apply wobble around the random axis
        groupRef.current.rotateOnWorldAxis(wobbleAxis.current, amplitude * 0.1);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={4}
      dispose={null}
    />
  );
}

export function Swords() {
  // Spread increased for monumental feel
  // Y positions raised to ensure only tip is buried
  const targets: {
    pos: [number, number, number];
    rot: [number, number, number];
  }[] = [
    { pos: [0, 5.0, 0], rot: [0, 0, 0] },
    { pos: [-12, 4.5, 8], rot: [0.1, 0.5, 0] },
    { pos: [10, 2.5, -10], rot: [-0.1, -0.2, 0] },
    { pos: [-8, 3.5, -12], rot: [0, 0, -0.1] },
    { pos: [14, 2.0, 12], rot: [0.05, 1.0, 0.05] },
  ];

  return (
    <>
      {targets.map((target, i) => (
        <Sword
          key={i}
          position={target.pos}
          rotation={target.rot as [number, number, number]}
          delay={1.0 + i * 0.4}
        />
      ))}
    </>
  );
}
