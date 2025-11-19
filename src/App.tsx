import { useRef, useState, useLayoutEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import Hero from "./components/Hero/Hero";
import Section from "./components/Section/Section";
import ParallaxText from "./components/ParallaxText/ParallaxText";
import ExperienceCard from "./components/ExperienceCard/ExperienceCard";
import { EXPERIENCES } from "./shared/constants";
import "./App.css";

const pageVariants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

function App() {
  const experiencesContainerRef = useRef<HTMLDivElement>(null);
  const experiencesRef = useRef<HTMLDivElement>(null);

  const [contentWidth, setContentWidth] = useState(0);
  useLayoutEffect(() => {
    const handleResize = () => {
      if (experiencesRef.current) {
        setContentWidth(experiencesRef.current.scrollWidth);
      }
    };
    handleResize(); // Initial measurement
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const x = useMotionValue(0);
  const scrollProgress = useMotionValue(0);

  useLenis(
    (lenis) => {
      if (!experiencesContainerRef.current || contentWidth === 0) return;

      const rect = experiencesContainerRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      const start = rect.top + lenis.scroll;
      const progress = (lenis.scroll - start) / (rect.height - viewHeight);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      scrollProgress.set(clampedProgress);
      const newX = clampedProgress * (window.innerWidth - contentWidth);
      x.set(newX);
    },
    [contentWidth]
  );

  return (
    <motion.div
      className="voyage-container"
      variants={pageVariants}
      initial="initial"
      exit="exit"
    >
      {/* Hero Section */}
      <Hero />

      {/* Introduction */}
      <Section className="intro-section">
        <ParallaxText offset={30}>
          <div className="intro-content">
            <h2>Where Europe Ends and Asia Begins</h2>
            <p className="intro-text">
              Nestled between the Greater and Lesser Caucasus mountains, Georgia
              is a land where hospitality is sacred, where every meal is a
              feast, and where history walks beside you on cobblestone streets.
              This is not just a destination—it's an awakening.
            </p>
            <p className="intro-signature">— Rezo, Your Host</p>
          </div>
        </ParallaxText>
      </Section>

      {/* Experience Cards */}
      <div ref={experiencesContainerRef} className="experiences-container">
        <div className="sticky-container">
          <motion.div
            ref={experiencesRef}
            className="experiences"
            style={{ x }}
          >
            {EXPERIENCES.map((exp, index) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                index={index}
                scrollProgress={scrollProgress}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Interactive Map Journey */}
      {/* <MapJourney /> */}

      {/* Testimonial */}
      <Section className="testimonial-section">
        <div className="testimonial">
          <div className="quote-mark">„</div>
          <p className="testimonial-text">
            Georgia didn't change my life—it reminded me what living actually
            means. Three days turned into three weeks. I'm already planning my
            return.
          </p>
          <p className="testimonial-author">— Maria, Barcelona</p>
        </div>
      </Section>

      {/* Journey Begins */}
      <Section className="journey-section">
        <div className="journey-content">
          <h2 className="journey-title">Your Journey Begins Here</h2>
          <p className="journey-text">
            Every path in Georgia leads to a story. Every story leads to a
            connection. Let Rezo guide you through the Georgia that guidebooks
            miss—the Georgia that lives in hearts, not just on maps.
          </p>
          <button className="cta-button">Start Your Voyage</button>
          <div className="contact-info">
            <p>Contact Rezo: voyage@georgiarezo.com</p>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">Voyage Georgia Rezo</div>
          <div className="footer-tagline">
            Authentic Georgian Experiences Since 2025
          </div>
          <div className="footer-georgian">გაიხარე საქართველო</div>
        </div>
      </footer>
    </motion.div>
  );
}

export default App;
