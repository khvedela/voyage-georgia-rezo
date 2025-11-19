import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { STORY_LOCATIONS } from "../../shared/constants";
import "./MapJourney.css";
import "./MapJourney.css";

export default function MapJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: STORY_LOCATIONS[0].coordinates.longitude,
    latitude: STORY_LOCATIONS[0].coordinates.latitude,
    zoom: STORY_LOCATIONS[0].zoom,
    pitch: STORY_LOCATIONS[0].pitch,
    bearing: STORY_LOCATIONS[0].bearing,
  });

  const [activeStory, setActiveStory] = useState(0);

  // Initialize map on first load
  useEffect(() => {
    if (mapRef.current) {
      const firstLocation = STORY_LOCATIONS[0];
      mapRef.current.flyTo({
        center: [
          firstLocation.coordinates.longitude,
          firstLocation.coordinates.latitude,
        ],
        zoom: firstLocation.zoom,
        pitch: firstLocation.pitch,
        bearing: firstLocation.bearing,
        duration: 1500,
        essential: true,
      });
    }
  }, []);

  // Intersection Observer to track which story section is in view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            setActiveStory(index);

            const location = STORY_LOCATIONS[index];
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [
                  location.coordinates.longitude,
                  location.coordinates.latitude,
                ],
                zoom: location.zoom,
                pitch: location.pitch,
                bearing: location.bearing,
                duration: 1500,
                essential: true,
                curve: 1.3,
                easing: (t) =>
                  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
              });
            }
          }
        });
      },
      {
        threshold: 0.4,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    // Observe all story sections
    const sections = containerRef.current.querySelectorAll(".story-section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Use GSAP ScrollTrigger to pin the map between first and last story
  const pinRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    // Ensure the map is using the CSS var for `--map-top` before any ScrollTrigger pins.
    // Compute a vertical top that centers the map beside the active story so it
    // appears lower (not pinned to the viewport top) before pinning begins.

    if (mapContainerRef.current) {
      mapContainerRef.current.style.removeProperty("top");
    }

    if (!containerRef.current || !mapContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const first = containerRef.current.querySelector(
      ".story-section[data-index='0']"
    ) as HTMLElement | null;
    const last = containerRef.current.querySelector(
      `.story-section[data-index='${STORY_LOCATIONS.length - 1}']`
    ) as HTMLElement | null;

    if (!first || !last) return;

    const clearPinnedAlignment = () => {
      const mapEl = mapContainerRef.current;
      if (!mapEl) return;
      mapEl.style.left = "";
      mapEl.style.width = "";
      mapEl.style.top = "";
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: first,
        start: "top top",
        endTrigger: containerRef.current,
        end: "bottom bottom",
        pin: mapContainerRef.current,
        pinSpacing: false,
        scrub: false,
        markers: false,
        anticipatePin: 1,
        onLeave: clearPinnedAlignment,
        onLeaveBack: clearPinnedAlignment,
      },
    });

    // store the scroll trigger so other effects can query pinned state
    pinRef.current = tl.scrollTrigger ?? null;

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      pinRef.current = null;
    };
  }, []);

  // When the map hits the end, fix its position at the bottom of the container
  // and keep the same horizontal position (left and width) so it doesn't jump.
  // no need to manually toggle map anchoring - ScrollTrigger handles it

  // Refresh ScrollTrigger on resize to keep pin positions accurate
  useEffect(() => {
    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "your_mapbox_token_here") {
    return (
      <div ref={containerRef} className="map-journey-placeholder">
        <div className="map-placeholder-content">
          <h3>Interactive Journey Awaits</h3>
          <p>Add your Mapbox token to .env file:</p>
          <code>VITE_MAPBOX_TOKEN=your_token_here</code>
          <p className="map-placeholder-note">
            Get free token at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  const currentLocation = STORY_LOCATIONS[activeStory];

  return (
    <div ref={containerRef} className="map-journey-split">
      {/* Map on the right (sticky) */}
      <motion.div ref={mapContainerRef} className={`map-journey-map-container`}>
        <motion.div
          className="map-journey-map"
          style={{
            backgroundColor: currentLocation.color,
            transition: "background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            style={{ width: "100%", height: "100%" }}
            terrain={{ source: "mapbox-dem", exaggeration: 2 }}
            fog={{
              range: [0.5, 10],
              color: currentLocation.color,
              "horizon-blend": 0.3,
            }}
            dragPan={true}
            dragRotate={true}
            scrollZoom={false}
            keyboard={false}
            doubleClickZoom={true}
            touchZoomRotate={false}
            minZoom={5}
            maxZoom={16}
          >
            {/* Custom markers */}
            {STORY_LOCATIONS.map((loc, index) => (
              <Marker
                key={loc.id}
                longitude={loc.coordinates.longitude}
                latitude={loc.coordinates.latitude}
                anchor="bottom"
              >
                <motion.div
                  className="custom-marker"
                  animate={{
                    scale: index === activeStory ? 1.3 : 0.85,
                    opacity: index === activeStory ? 1 : 0.4,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1],
                    scale: { type: "spring", stiffness: 200, damping: 20 },
                  }}
                  style={{
                    fontSize: "2.2rem",
                    filter:
                      index === activeStory
                        ? "drop-shadow(0 4px 16px rgba(212,165,116,0.8))"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    transition: "filter 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* emoji removed; marker is styled via CSS */}
                </motion.div>
              </Marker>
            ))}

            <NavigationControl
              position="bottom-right"
              showCompass={true}
              visualizePitch={true}
            />
          </Map>
        </motion.div>
      </motion.div>

      {/* Location label overlay */}
      <motion.div
        className="map-location-label"
        key={currentLocation.id}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="map-location-name">{currentLocation.name}</div>
        <div className="map-location-name-en">{currentLocation.nameEn}</div>
      </motion.div>

      {/* Progress dots overlay on map */}
      <div className="map-progress-dots">
        {STORY_LOCATIONS.map((loc, index) => (
          <motion.div
            key={loc.id}
            className="map-dot"
            animate={{
              width: index === activeStory ? "40px" : "32px",
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              background:
                index <= activeStory
                  ? "linear-gradient(90deg, #d4a574 0%, #f0d9b5 100%)"
                  : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Story sections on the left (scrollable) */}
      <div className="map-journey-stories">
        {STORY_LOCATIONS.map((loc, index) => (
          <motion.div
            key={loc.id}
            data-index={index}
            className={`story-section ${
              index === activeStory ? "story-section-active" : ""
            }`}
            initial={{ opacity: 0.5, y: 30 }}
            whileInView={{ opacity: index === activeStory ? 1 : 0.6, y: 0 }}
            viewport={{ amount: 0.4, once: false }}
            transition={{
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.6 },
              y: { duration: 0.7 },
            }}
          >
            <div className="story-number">
              {String(index + 1).padStart(2, "0")}
            </div>
            {/* story icon removed for a cleaner, professional UI */}
            <h3 className="story-title-geo">{loc.name}</h3>
            <h4 className="story-title-en">{loc.nameEn}</h4>
            <p className="story-text">{loc.story}</p>

            {/* Location metadata */}
            {(loc.elevation || loc.population || loc.distance) && (
              <div className="story-meta">
                {loc.elevation && (
                  <div className="story-meta-item">
                    <div className="story-meta-label">Elevation</div>
                    <div className="story-meta-value">{loc.elevation}</div>
                  </div>
                )}
                {loc.population && (
                  <div className="story-meta-item">
                    <div className="story-meta-label">Population</div>
                    <div className="story-meta-value">{loc.population}</div>
                  </div>
                )}
                {loc.distance && (
                  <div className="story-meta-item">
                    <div className="story-meta-label">From Tbilisi</div>
                    <div className="story-meta-value">{loc.distance}</div>
                  </div>
                )}
              </div>
            )}

            {/* Progress indicator for mobile */}
            <div className="story-progress-mobile">
              {String(index + 1)} / {STORY_LOCATIONS.length}
            </div>
          </motion.div>
        ))}

        {/* End boundary is detected by observing the last story section directly */}
      </div>
    </div>
  );
}
