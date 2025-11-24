"use client";

import dynamic from "next/dynamic";
import { Mountain, Compass, Users, MapIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CustomCursor } from "./components/ui/CustomCursor";
import { GravityScroll } from "./components/ui/GravityScrollPhysics";
import { WineGradientFlow } from "./components/ui/WineGradientFlow";
import { TimeOfDayAtmosphere } from "./components/ui/TimeOfDayAtmosphere";

// Dynamically import the Scene component
const Scene = dynamic(() => import("./components/Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-white font-mono text-xs tracking-[0.5em] animate-pulse">
      INITIALIZING REALITY...
    </div>
  ),
});

function Content() {
  // scroll logic is handled by the user scrolling the page, driven by ScrollControls in Scene.tsx

  return (
    <div className="w-full text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-start mix-blend-difference pointer-events-none">
        {/* Changed to row layout on medium screens to prevent "cramping" */}
        <div className="font-mono text-xs md:text-sm tracking-widest flex flex-col md:flex-row md:gap-4">
          <span>VOYAGE</span>
          <span>GEORGIA</span>
          <span>REZO</span>
        </div>
        <div className="font-mono text-xs md:text-sm tracking-widest text-right hidden md:block">
          <span>COORD: 41.7151° N</span>
          <span>44.8271° E</span>
        </div>
      </nav>

      {/* Page 1: Hero Section */}
      <section className="h-screen relative flex flex-col justify-center px-4 md:px-12 pointer-events-none">
        <div className="max-w-[90vw] mx-auto w-full">
          <GravityScroll mode="spiral" intensity={0.15} speed={1}>
            <h1 className="text-[12vw] leading-[0.8] font-black tracking-tighter text-white/90 mix-blend-overlay break-words mb-8">
              UNLOCK <br />
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">CAUCASUS</span>
            </h1>
          </GravityScroll>

          {/* Fixed positioning to prevent overlap */}
          <div className="mt-8 md:mt-12 pointer-events-auto max-w-md">
            <GravityScroll mode="wave" intensity={0.2}>
              <p className="font-mono text-sm md:text-base tracking-[0.15em] mb-4 text-emerald-400">
                /// WHERE LEGENDS ARE BORN
              </p>
            </GravityScroll>
            <p className="text-base md:text-lg font-light text-white/80 leading-relaxed">
              Journey through the birthplace of wine, where 8,000-year-old traditions meet untamed wilderness.
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 font-mono text-xs tracking-widest text-white/60 animate-bounce">
          ↓ DESCEND INTO HISTORY
        </div>
      </section>

      {/* Page 2: Immersive Tour Section - Redesigned */}
      <section id="details" className="min-h-screen relative px-4 md:px-12 py-24 pointer-events-auto">
        {/* Background gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-16">
            <GravityScroll mode="spiral" intensity={0.1}>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-white">
                THE OFFERING
              </h2>
            </GravityScroll>
            <div className="w-24 h-1 bg-emerald-500 mb-6" />
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Curated expeditions into Georgia's soul. Each journey honors the warriors of Didgori, who defended these mountains in 1121 AD.
            </p>
          </div>

          {/* Tour Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                id: "01",
                title: "HIGH CAUCASUS",
                subtitle: "Mountain Expedition",
                desc: "Trek to Ushguli and Omalo at 2,200 meters. Europe's highest villages where time stands still.",
                highlight: "3 DAYS · SVANETI REGION",
                icon: <Mountain className="w-8 h-8" />
              },
              {
                id: "02",
                title: "QVEVRI WINE",
                subtitle: "Ancestral Cellars",
                desc: "8,000 years of wine-making in buried clay vessels. Taste amber wines unchanged since antiquity.",
                highlight: "2 DAYS · KAKHETI VALLEY",
                icon: <Compass className="w-8 h-8" />
              },
              {
                id: "03",
                title: "LOST CHRONICLES",
                subtitle: "Medieval Legacy",
                desc: "Monasteries, fortresses, and the battlefield of Didgori. Walk where King David changed history.",
                highlight: "4 DAYS · CENTRAL GEORGIA",
                icon: <MapIcon className="w-8 h-8" />
              },
            ].map((tour, i) => (
              <GravityScroll key={tour.id} mode="orbital" intensity={0.05 * (i + 1)} speed={1}>
                <motion.div
                  className="group relative h-full"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Card */}
                  <div className="relative h-full p-8 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border-2 border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500 backdrop-blur-sm">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500 text-black font-black text-2xl flex items-center justify-center">
                      {tour.id}
                    </div>

                    {/* Icon */}
                    <div className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                      {tour.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
                      {tour.title}
                    </h3>
                    <p className="text-sm font-mono text-emerald-400 mb-4 tracking-wider">
                      {tour.subtitle}
                    </p>
                    <p className="text-base text-white/70 mb-6 leading-relaxed">
                      {tour.desc}
                    </p>

                    {/* Highlight */}
                    <div className="pt-4 border-t border-white/10">
                      <p className="font-mono text-xs text-white/50 tracking-widest">
                        {tour.highlight}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </GravityScroll>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16">
            <motion.div
              className="relative p-10 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 hover:from-emerald-500/20 transition-all duration-500 cursor-pointer group"
              whileHover={{ x: 8 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
                    BEGIN YOUR ODYSSEY
                  </h3>
                  <p className="font-mono text-sm text-white/60">
                    Custom itineraries · Private guides · Authentic experiences
                  </p>
                </div>
                <div className="px-8 py-4 bg-emerald-500 text-black font-bold text-sm tracking-widest hover:bg-white transition-colors flex items-center gap-2 group-hover:gap-4 transition-all">
                  INITIATE <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Georgian Footer */}
          <div className="mt-12 text-center">
            <p className="font-mono text-sm text-white/40">
              EST. 2024 · TBILISI, GEORGIA · <span className="text-white/60">საქართველო</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="w-full h-screen bg-neutral-950">
      <CustomCursor />
      <WineGradientFlow />
      <TimeOfDayAtmosphere />
      <Scene>
        <Content />
      </Scene>
    </main>
  );
}
