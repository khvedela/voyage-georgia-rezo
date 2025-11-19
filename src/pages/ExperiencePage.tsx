import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EXPERIENCES } from "../shared/constants";
import "./ExperiencePage.css";

export default function ExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const experience = EXPERIENCES.find((exp) => exp.id === id);
  const [scrollY, setScrollY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = EXPERIENCES.findIndex((e) => e.id === id);
  const nextExperience = EXPERIENCES[(currentIndex + 1) % EXPERIENCES.length];
  const prevExperience =
    EXPERIENCES[(currentIndex - 1 + EXPERIENCES.length) % EXPERIENCES.length];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow key navigation
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(`/experience/${prevExperience.id}`);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(`/experience/${nextExperience.id}`);
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, prevExperience.id, nextExperience.id]);

  if (!experience) {
    return <div>Experience not found</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      className="experience-page-container"
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.6, 0.01, 0.05, 0.95],
      }}
    >
      {/* Animated background with layoutId */}
      <motion.div
        className="experience-page-background"
        layoutId={`card-container-${experience.id}`}
        style={{
          backgroundColor: experience.color,
        }}
        transition={{
          layout: {
            duration: 0.5,
            ease: [0.6, 0.01, 0.05, 0.95],
          },
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
            ease: "easeInOut",
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
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Close button */}
      <motion.button
        className="close-button"
        onClick={() => navigate("/")}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Close and return to home (Press Escape)"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </motion.button>

      {/* Main content - split layout */}
      <div className="experience-split-layout">
        {/* Left side - Hero */}
        <div className="experience-hero">
          <motion.div
            className="experience-number-display"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.6, 0.01, 0.05, 0.95],
            }}
          >
            {String(currentIndex + 1).padStart(2, "0")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.6, 0.01, 0.05, 0.95],
            }}
          >
            {experience.title.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.25 + i * 0.01,
                  ease: [0.6, 0.01, 0.05, 0.95],
                }}
                style={{ display: "inline-block" }}
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
              delay: 0.35,
              ease: [0.6, 0.01, 0.05, 0.95],
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
        </div>

        {/* Right side - Content */}
        <motion.div
          className="experience-content-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.6, 0.01, 0.05, 0.95],
          }}
        >
          <div className="content-inner">
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
                Journey through landscapes that have witnessed millennia of
                history. Every corner reveals stories passed down through
                generations, where tradition and modernity dance in perfect
                harmony.
              </p>
              <p>
                This isn't tourism—it's transformation. Connect with local
                artisans, share meals with families who've lived here for
                centuries, and discover the Georgia that exists beyond
                postcards.
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
                Questions? Contact Rezo:{" "}
                <a href="mailto:voyage@georgiarezo.com">
                  voyage@georgiarezo.com
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation to other experiences */}
      <motion.div
        className="experience-navigation"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          to={`/experience/${prevExperience.id}`}
          className="nav-card prev"
          aria-label={`Previous experience: ${prevExperience.subtitle}`}
        >
          <div className="nav-label">Previous · ←</div>
          <div className="nav-title">{prevExperience.subtitle}</div>
        </Link>
        <Link
          to={`/experience/${nextExperience.id}`}
          className="nav-card next"
          aria-label={`Next experience: ${nextExperience.subtitle}`}
        >
          <div className="nav-label">Next · →</div>
          <div className="nav-title">{nextExperience.subtitle}</div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
