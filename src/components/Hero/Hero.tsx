import { motion, useScroll, useTransform } from "framer-motion";
import "./Hero.css";

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  return (
    <motion.div className="hero" style={{ scale: scaleProgress }}>
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2 }}
        >
          <h1 className="hero-title">
            <span className="georgian">საქართველო</span>
            <span className="english">Georgia</span>
          </h1>
        </motion.div>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
        >
          A Journey Through Time, Taste, and Wonder
        </motion.p>

        <motion.div
          className="hero-brand"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
        >
          <div className="brand-name">Voyage Georgia Rezo</div>
          <div className="brand-tagline">Your Guide to the Authentic</div>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="scroll-arrow">↓</div>
          <span>Scroll to Discover</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
