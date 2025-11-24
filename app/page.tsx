"use client";

import dynamic from "next/dynamic";
import { Compass, Map as MapIcon, Mountain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CustomCursor } from "./components/ui/CustomCursor";
import { GravityScroll } from "./components/ui/GravityScrollPhysics";

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
        <div className="max-w-[90vw] mx-auto w-full relative">
          <GravityScroll mode="spiral" intensity={0.15} speed={1}>
            <h1 className="text-[12vw] leading-[0.8] font-black tracking-tighter text-white/90 mix-blend-overlay break-words">
              UNLOCK <br />
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">CAUCASUS</span>
            </h1>
          </GravityScroll>
          <div className="absolute right-0 bottom-0 md:bottom-[20%] md:right-[10%] text-right pointer-events-auto">
            <GravityScroll mode="wave" intensity={0.2}>
              <p className="font-mono text-xs md:text-sm tracking-[0.2em] mb-2 text-emerald-400">
                /// BEYOND THE MAP
              </p>
            </GravityScroll>
            <p className="max-w-xs text-sm md:text-base font-light text-neutral-400 leading-relaxed hidden md:block mb-6">
              A curated expedition into the ancient heart of Georgia.
              Forget tourism. This is a pilgrimage.
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 font-mono text-[10px] tracking-widest opacity-50 animate-bounce">
          ↓ DESCEND
        </div>
      </section>

      {/* Page 2: Details Section */}
      <section id="details" className="min-h-screen flex items-center px-4 md:px-12 py-24 pointer-events-auto">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          <div className="md:col-span-4 flex flex-col justify-between h-full space-y-12">
            <div>
              <h2 className="text-6xl font-black tracking-tighter mb-4">THE<br />OFFERING</h2>
              <div className="w-12 h-1 bg-emerald-500" />
            </div>
            <div className="hidden md:block font-mono text-xs text-neutral-500">
              EST. 2024<br />TBILISI, GEORGIA
            </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 gap-4">
            {[
              {
                id: "01",
                title: "SECRETS OF THE HIGH PASS",
                desc: "Off-road expeditions to Ushguli and Omalo.",
                coords: "42.9°N / 43.0°E",
                icon: <Mountain className="w-5 h-5" />
              },
              {
                id: "02",
                title: "ANCIENT VINES",
                desc: "Exclusive access to private qvevri wine cellars.",
                coords: "41.9°N / 45.8°E",
                icon: <Compass className="w-5 h-5" />
              },
              {
                id: "03",
                title: "LOST CHRONICLES",
                desc: "Guided historical deep-dives into forgotten fortresses.",
                coords: "41.7°N / 44.8°E",
                icon: <MapIcon className="w-5 h-5" />
              }
            ].map((item, i) => (
              <GravityScroll
                key={i}
                mode="orbital"
                intensity={0.3 + i * 0.1}
                speed={1}
              >
                <motion.div
                  className="hover-trigger group relative bg-neutral-900/40 border border-white/10 p-8 overflow-hidden cursor-none"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.div
                    className="absolute inset-0 bg-emerald-900/20 z-0"
                    variants={{
                      rest: { scaleY: 0, originY: 1 },
                      hover: { scaleY: 1, originY: 1 }
                    }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  />
                  <div className="relative z-10">
                    <div className="absolute top-0 right-0 font-mono text-xs text-emerald-500/50 flex flex-col items-end">
                      <span>{item.id}</span>
                      <motion.span
                        className="text-emerald-400"
                        variants={{
                          rest: { opacity: 0, x: 10 },
                          hover: { opacity: 1, x: 0 }
                        }}
                      >
                        {item.coords}
                      </motion.span>
                    </div>
                    <div className="flex items-start gap-6">
                      <motion.div
                        className="p-3 bg-white/5 rounded-none text-white border border-transparent"
                        variants={{
                          rest: { borderColor: "rgba(255,255,255,0)" },
                          hover: { borderColor: "rgba(52, 211, 153, 0.5)", color: "#34d399" }
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-emerald-400 transition-colors duration-300">{item.title}</h3>
                        <p className="font-mono text-sm text-neutral-400 max-w-md">{item.desc}</p>
                        <motion.div
                          className="mt-4 flex items-center gap-2 text-xs tracking-widest text-emerald-400 uppercase"
                          variants={{
                            rest: { opacity: 0, y: 10 },
                            hover: { opacity: 1, y: 0 }
                          }}
                        >
                          Initialize Route <ArrowRight className="w-3 h-3" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </GravityScroll>
            ))}
            <div className="mt-8 p-8 border border-emerald-500/30 bg-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/60 transition-all cursor-pointer group hover-trigger">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold tracking-widest uppercase">Begin Your Odyssey</h3>
                <p className="font-mono text-xs text-emerald-400 mt-1">CUSTOM_ITINERARY_BUILDER_V1.0</p>
              </div>
              <div className="px-8 py-3 bg-white text-black font-bold text-sm tracking-widest hover:bg-emerald-400 transition-colors">
                INITIATE
              </div>
            </div>
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
      <Scene>
        <Content />
      </Scene>
    </main>
  );
}
