"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Mountain, Compass, MapIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { CustomCursor } from "./components/ui/CustomCursor";
import { GravityScroll } from "./components/ui/GravityScrollPhysics";
import { WineGradientFlow } from "./components/ui/WineGradientFlow";
import { TimeOfDayAtmosphere } from "./components/ui/TimeOfDayAtmosphere";
import { GeorgianPatternOverlay } from "./components/ui/GeorgianPatternOverlay";
import { SideBrokenLines } from "./components/ui/SideBrokenLines";
import {
  GeorgianCrossPattern,
  SwordGlint,
  DepthLift,
} from "./components/ui/GeorgianAnimations";

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
  // Inline helper for the new minimal tour card
  type Tour = {
    id: string;
    title: string;
    subtitle: string;
    desc: string;
    highlight: string;
    icon: ReactNode;
  };

  const TourCard = ({ id, title, subtitle, desc, highlight, icon }: Tour) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col h-full p-6 md:p-8 border border-white/10 bg-neutral-900/60 backdrop-blur-md rounded-xl hover:bg-neutral-900/80 transition-colors duration-500 group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-full bg-white/5 text-emerald-300 group-hover:text-emerald-200 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.2)]">
          {icon}
        </div>
        <span className="font-mono text-xs text-white/40 tracking-widest drop-shadow-md">
          {id}
        </span>
      </div>

      <div className="mb-auto">
        <h4 className="text-xs font-mono text-emerald-400/90 mb-2 uppercase tracking-wider drop-shadow-sm">
          {subtitle}
        </h4>
        <h3 className="text-xl md:text-2xl font-medium text-white mb-3 tracking-tight leading-snug drop-shadow-lg">
          {title}
        </h3>
        <p className="text-sm text-white/70 leading-relaxed font-light drop-shadow-md">
          {desc}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] drop-shadow-sm">
          {highlight}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full text-white font-sans selection:bg-emerald-900/30 selection:text-emerald-200">
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-12 z-50 flex justify-between items-start pointer-events-none mix-blend-difference">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm tracking-tighter text-white/90 drop-shadow-md">
            VOYAGE GEORGIA
          </span>
          <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase drop-shadow-sm">
            Rezo Archive
          </span>
        </div>
        <div className="hidden md:block text-right font-mono text-[10px] text-white/60 leading-tight drop-shadow-sm">
          <div>41.7151° N</div>
          <div>44.8271° E</div>
        </div>
      </nav>

      {/* Page 1: Hero */}
      <section className="h-screen w-full flex flex-col justify-center px-6 md:px-20 pointer-events-none">
        <div className="max-w-4xl">
          <GravityScroll mode="orbital" intensity={0.05}>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-[12vw] md:text-[7rem] leading-[0.85] font-bold tracking-tighter text-white mb-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              CAUCASUS
              <br />
              <span className="text-emerald-400/30 ml-[2vw] drop-shadow-none">
                ARCHIVE
              </span>
            </motion.h1>
          </GravityScroll>

          <div className="max-w-md ml-[2vw]">
            <GravityScroll mode="orbital" intensity={0.1} speed={1.2}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-black/40 to-transparent backdrop-blur-sm border-l border-white/10"
              >
                <p className="text-sm md:text-base text-white/90 font-light leading-relaxed mb-6 drop-shadow-md">
                  An ethnographic vault. A field-led cartography of ritual,
                  craft, and wine. We do not sell trips; we curate rites.
                </p>
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 drop-shadow-sm">
                  <span>Est. 2024</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500/80" />
                  <span>Tbilisi</span>
                </div>
              </motion.div>
            </GravityScroll>
          </div>
        </div>
      </section>

      {/* Page 2: Selected Odysseys */}
      <section className="min-h-screen w-full px-6 md:px-20 py-24 md:py-32 pointer-events-auto flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-16 md:mb-24 border-l border-white/20 pl-6 md:pl-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4 drop-shadow-lg"
            >
              Selected Odysseys
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-white/80 max-w-xl font-light leading-relaxed drop-shadow-md bg-black/20 p-2 rounded-lg -ml-2"
            >
              Curated expeditions into the soul of Georgia. Each journey honors
              the warriors of Didgori and the silence of the mountains.
            </motion.p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 md:gap-8 pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
            {[
              {
                id: "01",
                title: "Atlas of Cold Fire",
                subtitle: "Svaneti",
                desc: "Wander ancestral watchpost hamlets where carved altars and winter ferment meet sky.",
                highlight: "Limited Access",
                icon: <Mountain className="w-5 h-5" />,
              },
              {
                id: "02",
                title: "Qvevri Palimpsest",
                subtitle: "Kakheti",
                desc: "Bury a taste in the ground and listen to its memory. Private cellars and amber curations.",
                highlight: "Culinary Deep Dive",
                icon: <Compass className="w-5 h-5" />,
              },
              {
                id: "03",
                title: "The Didgorian Map",
                subtitle: "Kartli",
                desc: "Walk a single battle line at dawn: ruins, echoes, and the odd orchard where stories coagulate.",
                highlight: "Historical Axis",
                icon: <MapIcon className="w-5 h-5" />,
              },
            ].map((tour, i) => (
              <div
                key={tour.id}
                className="min-w-[85vw] md:min-w-0 snap-center"
              >
                <TourCard {...tour} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page 3+: Regions of Georgia (Bold Vertical Experience) */}
      <div className="pointer-events-auto relative">
        {/* Floating Asomtavruli Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {[
            { char: 'Ⴀ', top: '10%', left: '5%', delay: 0, duration: 25 },
            { char: 'Ⴁ', top: '25%', right: '8%', delay: 0.2, duration: 30 },
            { char: 'Ⴂ', top: '45%', left: '12%', delay: 0.4, duration: 28 },
            { char: 'Ⴃ', top: '60%', right: '15%', delay: 0.6, duration: 32 },
            { char: 'Ⴄ', top: '75%', left: '8%', delay: 0.8, duration: 27 },
            { char: 'Ⴅ', top: '85%', right: '10%', delay: 1, duration: 29 },
            { char: 'Ⴆ', top: '35%', left: '85%', delay: 0.5, duration: 26 },
          ].map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0.05, 0.15, 0.05],
                y: [-100, 100],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                delay: letter.delay,
                duration: letter.duration,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute text-[12rem] md:text-[18rem] font-black text-emerald-500/10 blur-sm select-none"
              style={{
                top: letter.top,
                left: letter.left,
                right: letter.right
              }}
            >
              {letter.char}
            </motion.div>
          ))}
        </div>
        {/* Regions Header */}
        <section className="min-h-screen w-full flex flex-col justify-center items-center px-6 md:px-20 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-[15vw] md:text-[12rem] font-black tracking-tighter leading-none text-white mb-8 drop-shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
              REGIONS
            </h2>
            <p className="text-lg md:text-2xl text-emerald-400/90 font-light tracking-wide drop-shadow-lg">
              Seven Kingdoms, One Soul
            </p>
          </motion.div>
        </section>

        {/* Kakheti - Wine Kingdom */}
        <motion.section
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative min-h-screen w-full flex items-center overflow-hidden"
        >
          {/* Glitch Effect on Entry */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, times: [0, 0.5, 1] }}
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              mixBlendMode: 'overlay'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-orange-900/20 to-transparent" />

          {/* Decorative Circle */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: 45 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/10 to-orange-600/5 blur-3xl"
          />

          <div className="container mx-auto px-6 md:px-20 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative mb-6">
                  <h3 className="text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_10px_60px_rgba(0,0,0,0.9)]">
                    KAKHETI
                  </h3>
                  {/* Georgian Script Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="absolute inset-0 text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-amber-500/40 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                    style={{ mixBlendMode: 'overlay' }}
                  >
                    კახეთი
                  </motion.div>
                </div>
                <div className="h-2 w-32 bg-gradient-to-r from-amber-500 to-orange-600 mb-8" />
                <p className="text-xl md:text-3xl text-white/90 font-light leading-relaxed mb-6 drop-shadow-lg">
                  The cradle of wine. Eight thousand years of qvevri buried deep.
                </p>
                <p className="text-base md:text-lg text-white/70 leading-relaxed drop-shadow-md bg-black/30 p-6 rounded-xl border-l-4 border-amber-500">
                  Endless vineyards stretch beneath the Caucasus. Ancient monasteries guard amber secrets.
                  Here, wine is not a beverage—it's archaeology.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-amber-900/40 to-orange-950/60 rounded-3xl border border-amber-500/20 backdrop-blur-sm shadow-[0_20px_80px_rgba(251,191,36,0.15)] p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl md:text-[10rem] font-black text-amber-500/30 drop-shadow-2xl">
                      8K
                    </div>
                    <div className="text-lg md:text-xl text-white/80 font-mono uppercase tracking-widest mt-4">
                      Years of Wine
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Svaneti - Mountain Fortress */}
        <motion.section
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative min-h-screen w-full flex items-center overflow-hidden"
        >
          {/* Glitch Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, times: [0, 0.5, 1] }}
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              mixBlendMode: 'overlay'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-gray-900/20 to-transparent" />

          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: -45 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute bottom-1/4 left-0 w-[700px] h-[700px] bg-gradient-to-br from-slate-500/10 to-gray-600/5 blur-3xl"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
          />

          <div className="container mx-auto px-6 md:px-20 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1 relative"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-800/50 to-gray-950/70 rounded-3xl border border-slate-400/20 backdrop-blur-sm shadow-[0_20px_80px_rgba(100,116,139,0.2)] p-12 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[shimmer_3s_linear_infinite]" />
                  <div className="text-center relative z-10">
                    <div className="text-8xl md:text-[10rem] font-black text-slate-300/40 drop-shadow-2xl">
                      1K
                    </div>
                    <div className="text-lg md:text-xl text-white/80 font-mono uppercase tracking-widest mt-4">
                      Stone Towers
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <div className="relative mb-6">
                  <h3 className="text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_10px_60px_rgba(0,0,0,0.9)]">
                    SVANETI
                  </h3>
                  {/* Georgian Script Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="absolute inset-0 text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-slate-400/40 drop-shadow-[0_0_30px_rgba(148,163,184,0.5)]"
                    style={{ mixBlendMode: 'overlay' }}
                  >
                    სვანეთი
                  </motion.div>
                </div>
                <div className="h-2 w-32 bg-gradient-to-r from-slate-400 to-gray-600 mb-8" />
                <p className="text-xl md:text-3xl text-white/90 font-light leading-relaxed mb-6 drop-shadow-lg">
                  Europe's highest inhabited realm. Towers pierce the clouds.
                </p>
                <p className="text-base md:text-lg text-white/70 leading-relaxed drop-shadow-md bg-black/30 p-6 rounded-xl border-l-4 border-slate-400">
                  A thousand defensive towers stand sentinel over alpine valleys. The Svan people never surrendered—
                  not to Mongols, not to empires, not to time itself.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Adjara - Coastal Paradise */}
        <motion.section
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative min-h-screen w-full flex items-center overflow-hidden"
        >
          {/* Glitch Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, times: [0, 0.5, 1] }}
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
              mixBlendMode: 'overlay'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-teal-900/20 to-transparent" />

          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: 90 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-600/5 blur-3xl"
          />

          <div className="container mx-auto px-6 md:px-20 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative mb-6">
                  <h3 className="text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_10px_60px_rgba(0,0,0,0.9)]">
                    ADJARA
                  </h3>
                  {/* Georgian Script Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="absolute inset-0 text-[20vw] md:text-[10rem] font-black leading-none tracking-tighter text-emerald-500/40 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                    style={{ mixBlendMode: 'overlay' }}
                  >
                    აჭარა
                  </motion.div>
                </div>
                <div className="h-2 w-32 bg-gradient-to-r from-emerald-500 to-teal-600 mb-8" />
                <p className="text-xl md:text-3xl text-white/90 font-light leading-relaxed mb-6 drop-shadow-lg">
                  Where mountains fall into the Black Sea.
                </p>
                <p className="text-base md:text-lg text-white/70 leading-relaxed drop-shadow-md bg-black/30 p-6 rounded-xl border-l-4 border-emerald-500">
                  Subtropical rainforests meet Ottoman minarets. Stone bridges arch over gorges.
                  This is Georgia's humid heartbeat—lush, green, and impossibly alive.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-emerald-900/40 to-teal-950/60 rounded-3xl border border-emerald-500/20 backdrop-blur-sm shadow-[0_20px_80px_rgba(16,185,129,0.15)] flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"
                  />
                  <div className="text-center relative z-10">
                    <div className="text-6xl md:text-8xl font-black text-emerald-500/40 drop-shadow-2xl mb-4">
                      BLACK
                    </div>
                    <div className="text-4xl md:text-6xl font-black text-teal-400/40 drop-shadow-2xl">
                      SEA
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Compact Regions Highlight */}
        <section className="relative min-h-screen w-full flex items-center overflow-hidden py-24">
          <div className="container mx-auto px-6 md:px-20">
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-white/90 mb-16 text-center drop-shadow-lg"
            >
              And More Sacred Ground
            </motion.h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Tusheti", desc: "Alpine wilderness. Open only 3 months.", color: "from-green-600 to-lime-700" },
                { name: "Kazbegi", desc: "Gateway north. Prometheus' chains.", color: "from-gray-600 to-slate-700" },
                { name: "Imereti", desc: "Golden Fleece country. Limestone caves.", color: "from-teal-600 to-cyan-700" },
                { name: "Racha", desc: "High forest realm. Khvanchkara wine.", color: "from-red-600 to-rose-700" },
              ].map((region, i) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl`} />
                  <div className="relative bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-full hover:border-white/30 transition-colors shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                    <h4 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-400 transition-all">
                      {region.name}
                    </h4>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed drop-shadow-sm">
                      {region.desc}
                    </p>
                    <div className={`mt-6 h-1 w-16 bg-gradient-to-r ${region.color} group-hover:w-full transition-all duration-500`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <section className="w-full py-12 flex justify-center items-center pointer-events-auto">
        <div className="text-center">
          <p className="font-mono text-sm text-white/40 mb-2">
            EST. 2024 · TBILISI, GEORGIA
          </p>
          <a
            href="#"
            className="text-emerald-400/80 hover:text-emerald-300 transition-colors drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
          >
            commune@voyage.ge
          </a>
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
      <GeorgianPatternOverlay />
      <SideBrokenLines />
      <Scene>
        <Content />
      </Scene>
    </main>
  );
}
