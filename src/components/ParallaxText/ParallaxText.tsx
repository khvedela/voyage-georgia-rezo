import { useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

interface ParallaxTextProps {
  children: React.ReactNode;
  offset?: number;
}

export default function ParallaxText({
  children,
  offset = 50,
}: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useLenis(() => {
    if (!ref.current) return;

    // Calculate progress of element through viewport
    const rect = ref.current.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const elementTop = rect.top;

    // A simple progress calculation (0 when bottom of element enters view, 1 when top leaves)
    const progress =
      1 - (elementTop + rect.height) / (viewHeight + rect.height);

    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Apply transform based on progress
    const newY = (clampedProgress - 0.5) * 2 * -offset;
    y.set(newY);
  }, [offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
