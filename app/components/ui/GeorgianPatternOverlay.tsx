"use client";

import { useEffect, useRef } from "react";

/**
 * Georgian Textile Pattern Overlay
 * Inspired by traditional Georgian carpet and textile patterns
 * Creates a subtle, animated background pattern
 */
export function GeorgianPatternOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        let scrollY = 0;
        const handleScroll = () => {
            scrollY = window.scrollY;
        };
        window.addEventListener("scroll", handleScroll);

        // Georgian pattern motifs
        const drawGeorgianCross = (x: number, y: number, size: number, opacity: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
            ctx.lineWidth = 1;

            // Cross arms
            ctx.beginPath();
            ctx.moveTo(-size, 0);
            ctx.lineTo(size, 0);
            ctx.moveTo(0, -size);
            ctx.lineTo(0, size);
            ctx.stroke();

            // Small decorative ends
            const endSize = size * 0.3;
            [-size, size].forEach(x => {
                ctx.strokeRect(x - endSize / 2, -endSize / 2, endSize, endSize);
            });
            [-size, size].forEach(y => {
                ctx.strokeRect(-endSize / 2, y - endSize / 2, endSize, endSize);
            });

            ctx.restore();
        };

        const drawDiamond = (x: number, y: number, size: number, opacity: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        };

        let time = 0;
        const animate = () => {
            time += 0.01;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const spacing = 150;
            const offsetY = scrollY * 0.3;

            // Draw pattern grid
            for (let y = -spacing; y < canvas.height + spacing; y += spacing) {
                for (let x = -spacing; x < canvas.width + spacing; x += spacing) {
                    const distance = Math.sqrt(
                        Math.pow((x - canvas.width / 2), 2) +
                        Math.pow((y - canvas.height / 2 + offsetY), 2)
                    );

                    const wave = Math.sin(distance * 0.005 + time) * 0.5 + 0.5;
                    const opacity = 0.03 + wave * 0.05;

                    // Alternate between cross and diamond
                    if ((Math.floor(x / spacing) + Math.floor(y / spacing)) % 2 === 0) {
                        drawGeorgianCross(x, y - offsetY % spacing, 8, opacity);
                    } else {
                        drawDiamond(x, y - offsetY % spacing, 10, opacity);
                    }
                }
            }

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
            className="fixed inset-0 pointer-events-none z-[5]"
            style={{ mixBlendMode: "screen" }}
        />
    );
}
