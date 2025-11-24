"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  
  // Mouse position using MotionValues for performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for the trailing cursor
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("hover-trigger")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden hidden md:block">
      {/* Main Reticle (Follows closely) */}
      <motion.div
        className="absolute w-4 h-4 border border-emerald-400 rounded-full flex items-center justify-center"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-[2px] h-[2px] bg-white rounded-full" />
      </motion.div>

      {/* Outer Ring / Trailer (Smooth Spring) */}
      <motion.div
        className="absolute border border-white/20 rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 64 : 32,
          height: isHovering ? 64 : 32,
          borderColor: isHovering ? "rgba(52, 211, 153, 0.5)" : "rgba(255, 255, 255, 0.1)",
          backgroundColor: isHovering ? "rgba(52, 211, 153, 0.05)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Decorative Crosshairs on Hover */}
        {isHovering && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-[1px] h-2 bg-emerald-400" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-[1px] h-2 bg-emerald-400" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-[1px] bg-emerald-400" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-[1px] bg-emerald-400" />
          </>
        )}
      </motion.div>
    </div>
  );
}
