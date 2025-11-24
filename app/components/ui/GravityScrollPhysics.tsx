"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useSpring, animated, to } from "@react-spring/web";

type GravityScrollMode = "orbital" | "spiral" | "wave" | "none";

type GravityScrollProps = {
    children: ReactNode;
    mode?: GravityScrollMode;
    intensity?: number;
    speed?: number;
    className?: string;
};

export function GravityScroll({
    children,
    mode = "orbital",
    intensity = 1,
    speed = 1,
    className = "",
}: GravityScrollProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const scrollY = useRef(0);

    // Spring animation for smooth transforms
    const [{ x, y, rotate }, api] = useSpring(() => ({
        x: 0,
        y: 0,
        rotate: 0,
        config: { tension: 120, friction: 14 },
    }));

    useEffect(() => {
        const handleScroll = () => {
            if (!elementRef.current) return;

            const rect = elementRef.current.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const elementCenter = rect.top + rect.height / 2;
            const distanceFromCenter = elementCenter - viewportCenter;

            // Normalize to -1 to 1 range
            const normalizedDistance = distanceFromCenter / viewportCenter;

            // Get scroll velocity
            const currentScrollY = window.scrollY;
            const velocity = Math.abs(currentScrollY - scrollY.current) * 0.1;
            scrollY.current = currentScrollY;

            let newX = 0;
            let newY = 0;
            let newRotate = 0;

            switch (mode) {
                case "orbital":
                    // Elements orbit around their position
                    const angle = normalizedDistance * Math.PI * intensity;
                    const radius = 50 * intensity + velocity * 10;
                    newX = Math.cos(angle) * radius;
                    newY = Math.sin(angle) * radius * 0.5; // Elliptical
                    newRotate = angle * 15; // Slight rotation
                    break;

                case "spiral":
                    // Elements spiral into view
                    const spiralAngle = normalizedDistance * Math.PI * 2 * intensity;
                    const spiralRadius = Math.abs(normalizedDistance) * 100 * intensity;
                    newX = Math.cos(spiralAngle) * spiralRadius;
                    newY = Math.sin(spiralAngle) * spiralRadius;
                    newRotate = spiralAngle * 30;
                    break;

                case "wave":
                    // Wave motion (sine wave)
                    newX = Math.sin(normalizedDistance * Math.PI * 2) * 30 * intensity;
                    newY = 0;
                    newRotate = normalizedDistance * 10 * intensity;
                    break;

                case "none":
                default:
                    newX = 0;
                    newY = 0;
                    newRotate = 0;
                    break;
            }

            // Apply transforms via spring
            api.start({
                x: newX,
                y: newY,
                rotate: newRotate,
            });
        };

        // Initial call
        handleScroll();

        // Throttled scroll listener
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [mode, intensity, speed, api]);

    return (
        <animated.div
            ref={elementRef}
            className={className}
            style={{
                transform: to([x, y, rotate], (xVal, yVal, rotateVal) =>
                    `translate3d(${xVal}px, ${yVal}px, 0) rotate(${rotateVal}deg)`
                ),
            }}
        >
            {children}
        </animated.div>
    );
}
