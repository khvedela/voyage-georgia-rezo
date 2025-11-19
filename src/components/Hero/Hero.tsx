import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

// Component for the actual 3D mountain particle cloud
function MountainCloud({ scrollProgress, mouse }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const noise3D = useMemo(() => createNoise3D(), []);

  const particles = useMemo(() => {
    const count = 50000; // High particle count for a dense cloud
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color('#6b7a99'); // Muted blue-grey
    const highlightColor = new THREE.Color('#d4a574'); // Gold highlight

    const width = 100;
    const depth = 100;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * width;
      const z = (Math.random() - 0.5) * depth;
      
      // Generate mountain height with noise
      const noise = noise3D(x * 0.05, z * 0.05, 0);
      const y = Math.pow(noise, 3) * 10; // Use power to create sharper peaks

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color based on height
      const color = baseColor.clone();
      color.lerp(highlightColor, Math.max(0, y / 10)); // Higher points get more highlight
      color.toArray(colors, i * 3);
    }
    return { positions, colors };
  }, [noise3D]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Animate camera based on scroll progress
    state.camera.position.z = 30 - scrollProgress.current * 40;
    state.camera.position.y = 5 + scrollProgress.current * 5;
    state.camera.lookAt(0, 0, 0);

    // 2. Animate particles for shimmering effect
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const z = positions[i3 + 2];
      const shimmer = noise3D(x * 0.1, z * 0.1, time * 0.1) * 0.1;
      positions[i3 + 1] += shimmer;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // 3. Mouse interaction ("wind")
    const mouseTarget = new THREE.Vector3(mouse.current.x * 20, mouse.current.y * 10, 30);
    state.camera.position.lerp(mouseTarget, 0.02);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const timer = setTimeout(() => {
      if (heroRef.current) {
        gsap.to(scrollProgress, {
          current: 1,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const georgianTitleStyle = {
    background: 'linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div ref={heroRef} className="hero-new">
      <div className="tapestry-canvas-container">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 5, 30]} fov={75} />
          <fogExp2 attach="fog" args={['#0a0a1a', 0.03]} />
          <MountainCloud scrollProgress={scrollProgress} mouse={mouse} />
        </Canvas>
      </div>
      <div className="hero-content-overlay">
        <h1 className="hero-title-new">
          <span className="georgian" style={georgianTitleStyle}>საქართველო</span>
          <span className="english">Georgia</span>
        </h1>
        <p className="hero-subtitle-new">A Journey Through Time, Taste, and Wonder</p>
      </div>
    </div>
  );
}