import { Link } from "react-router-dom";
import {
  motion,
  MotionValue,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useRef, useState } from "react";
import type { Experience } from "../../shared/types";
import "./ExperienceCard.css";
import { EXPERIENCES } from "../../shared/constants";

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  scrollProgress: MotionValue<number>;
}

export default function ExperienceCard({
  experience,
  index,
  scrollProgress,
}: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const numCards = EXPERIENCES.length;
  const snapPoint = index / (numCards - 1);

  const distance = useTransform(scrollProgress, (p) => p - snapPoint);
  const x = useTransform(distance, [-1, 1], [50, -50]);

  // Smoother magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 200 };
  const magneticX = useSpring(mouseX, springConfig);
  const magneticY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(magneticY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(magneticX, [-0.5, 0.5], [-3, 3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(deltaX * 0.5);
    mouseY.set(deltaY * 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="experience-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
    >
      <Link to={`/experience/${experience.id}`} className="experience-link">
        <motion.div
          className="experience-content"
          style={{
            backgroundColor: experience.color,
            rotateX,
            rotateY,
          }}
          layoutId={`card-container-${experience.id}`}
          transition={{
            layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            default: { duration: 0.3 },
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="card-gradient-overlay" />

          <motion.div style={{ x }}>
            <motion.div
              className="experience-number"
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              0{index + 1}
            </motion.div>

            <h3 className="experience-title-geo">{experience.title}</h3>

            <motion.h4
              className="experience-title-eng"
              animate={isHovered ? { opacity: 1 } : { opacity: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {experience.subtitle}
            </motion.h4>

            <p className="experience-description">{experience.description}</p>

            <motion.div
              className="experience-cta"
              animate={isHovered ? { gap: "0.75rem" } : { gap: "0.5rem" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>Explore</span>
              <motion.span
                className="cta-arrow"
                animate={isHovered ? { x: 3 } : { x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                →
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </Link>
    </div>
  );
}
