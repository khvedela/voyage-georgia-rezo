"use client";

import { useEffect, useRef } from "react";

export function WineGradientFlow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        opacity: number;
    }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Initialize particles
        for (let i = 0; i < 50; i++) {
            particles.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: 0,
                vy: 0,
                size: Math.random() * 60 + 20,
                opacity: 0,
            });
        }

        let scrollVelocity = 0;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            scrollVelocity = Math.abs(currentScrollY - lastScrollY) * 0.5;
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Fade scroll velocity
            scrollVelocity *= 0.95;

            particles.current.forEach((particle) => {
                // Update velocity based on scroll
                particle.vy = scrollVelocity * 0.3;
                particle.vx = (Math.random() - 0.5) * scrollVelocity * 0.1;

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Update opacity based on scroll velocity
                particle.opacity = Math.min(scrollVelocity * 0.02, 0.4);

                // Wrap around screen
                if (particle.y > canvas.height + particle.size) {
                    particle.y = -particle.size;
                    particle.x = Math.random() * canvas.width;
                }
                if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
                if (particle.x > canvas.width + particle.size) particle.x = -particle.size;

                // Draw wine stain gradient
                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.size
                );

                // Georgian wine colors (deep crimson to burgundy)
                gradient.addColorStop(0, `rgba(139, 0, 0, ${particle.opacity})`);
                gradient.addColorStop(0.5, `rgba(115, 20, 30, ${particle.opacity * 0.6})`);
                gradient.addColorStop(1, `rgba(80, 10, 20, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    particle.x - particle.size,
                    particle.y - particle.size,
                    particle.size * 2,
                    particle.size * 2
                );
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-10"
            style={{ mixBlendMode: "multiply" }}
        />
    );
}
