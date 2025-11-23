"use client";

import * as THREE from "three";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

type SwordProps = {
  scene: THREE.Group;
  position: [number, number, number];
  delay: number;
  rotation?: [number, number, number];
};

function Sword({ scene, position, delay, rotation = [0, 0, 0] }: SwordProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [landed, setLanded] = useState(false);
  
  // Animation state for impact wobble
  const impactTime = useRef(0);
  // Initialize with stable value, random is applied in useEffect
  const wobbleAxis = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    wobbleAxis.current = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
  }, []);

  // Clone the scene for this specific instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Start high up
  const dropHeight = 35;
  const targetY = position[1];
  const startY = targetY + dropHeight;
  const gravity = 60; // Visual gravity constant

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
        const frequency = 20;
        const damping = 4.0;
        const amplitude = 0.1 * Math.exp(-damping * timeSinceImpact) * Math.sin(frequency * timeSinceImpact);
        
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
        scale={3}
        dispose={null}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

export function Swords() {
  const { scene } = useGLTF("/sword.glb");

  // Spread increased by ~15%
  const targets: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [0, 0.5, 0], rot: [0, 0, 0] },
    { pos: [-2.3, 0.2, 1.15], rot: [0.2, 0.5, 0] },
    { pos: [2.3, -0.5, -1.15], rot: [-0.1, -0.2, 0] },
    { pos: [-1.75, 0.0, -2.3], rot: [0, 0, -0.3] },
    { pos: [2.1, -0.8, 2.3], rot: [0.1, 1.0, 0.1] },
  ];

  return (
    <>
      {targets.map((target, i) => (
        <Sword
          key={i}
          scene={scene}
          position={target.pos}
          rotation={target.rot as [number, number, number]}
          delay={1.0 + i * 0.2} // Slightly faster sequence
        />
      ))}
    </>
  );
}