import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EXPERIENCES } from "../shared/constants";
import "./ExperiencePage.css";

export default function ExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const experience = EXPERIENCES.find((exp) => exp.id === id);
  const [scrollY, setScrollY] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const parallaxY = useTransform(smoothMouseY, [0, 1], [-20, 20]);
  const parallaxX = useTransform(smoothMouseX, [0, 1], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY]);

  if (!experience) {
    return <div>Experience not found</div>;
  }

  const currentIndex = EXPERIENCES.findIndex(e => e.id === id);
  const nextExperience = EXPERIENCES[(currentIndex + 1) % EXPERIENCES.length];
  const prevExperience = EXPERIENCES[(currentIndex - 1 + EXPERIENCES.length) % EXPERIENCES.length];

  return (
    <motion.div 
      ref={containerRef}
      className="experience-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated background with layoutId */}
      <motion.div
        className="experience-page-background"
        layoutId={`card-container-${experience.id}`}
        style={{ 
          backgroundColor: experience.color,
          y: parallaxY,
        }}
        transition={{
          layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }}
      >
        <motion.div 
          className="bg-gradient-orb orb-1"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="bg-gradient-orb orb-2"
          animate={{ 
            x: [0, -120, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Close button */}
      <motion.button
        className="close-button"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </motion.button>

      {/* Main content - split layout */}
      <div className="experience-split-layout">
        {/* Left side - Hero */}
        <motion.div 
          className="experience-hero"
          style={{ x: parallaxX }}
        >
          <motion.div
            className="experience-number-display"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {String(currentIndex + 1).padStart(2, '0')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.7,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {experience.title.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.4 + i * 0.02,
                  ease: [0.22, 1, 0.36, 1]
                }}
                style={{ display: 'inline-block' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {experience.subtitle}
          </motion.h2>

          <motion.div 
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: scrollY < 100 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.div>
            <span>Scroll to explore</span>
          </motion.div>
        </motion.div>

        {/* Right side - Content */}
        <motion.div 
          className="experience-content-panel"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <motion.div 
            className="content-inner"
            style={{ y: useTransform(() => -scrollY * 0.3) }}
          >
            {/* Main description */}
            <motion.div
              className="content-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h3>The Experience</h3>
              <p className="lead-text">{experience.description}</p>
            </motion.div>

            {/* Extended details */}
            <motion.div
              className="content-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3>What Awaits</h3>
              <p>
                Journey through landscapes that have witnessed millennia of history. 
                Every corner reveals stories passed down through generations, where 
                tradition and modernity dance in perfect harmony.
              </p>
              <p>
                This isn't tourism—it's transformation. Connect with local artisans, 
                share meals with families who've lived here for centuries, and discover 
                the Georgia that exists beyond postcards.
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div
              className="content-section highlights"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3>Highlights</h3>
              <ul>
                <li>Authentic local experiences</li>
                <li>Expert cultural guides</li>
                <li>Hidden gems off the tourist path</li>
                <li>Curated gastronomy journeys</li>
                <li>Small group adventures</li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="content-section cta-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                className="book-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book This Experience
              </motion.button>
              <p className="contact-text">
                Questions? Contact Rezo: <a href="mailto:voyage@georgiarezo.com">voyage@georgiarezo.com</a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation to other experiences */}
      <motion.div 
        className="experience-navigation"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link to={`/experience/${prevExperience.id}`} className="nav-card prev">
          <div className="nav-label">Previous</div>
          <div className="nav-title">{prevExperience.subtitle}</div>
        </Link>
        <Link to={`/experience/${nextExperience.id}`} className="nav-card next">
          <div className="nav-label">Next</div>
          <div className="nav-title">{nextExperience.subtitle}</div>
        </Link>
      </motion.div>
    </motion.div>
  );
}