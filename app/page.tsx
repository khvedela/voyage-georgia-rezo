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
  return (
    <div className="w-full text-white font-sans">
      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
              VOYAGE GEORGIA
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              Rezo Archive
            </p>
          </div>
          <a
            href="#contact"
            className="px-6 py-2 bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold tracking-wide transition-colors rounded-md"
          >
            Contact Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen w-full flex items-center justify-center relative overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent" />
        <div className="text-center z-10 px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6 text-white"
          >
            GEORGIA
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-3xl font-light text-white max-w-2xl mx-auto"
          >
            Where 8000 years of culture meets untouched wilderness
          </motion.p>
        </div>
      </section>

      {/* Why Georgia - Cultural Heritage */}
      <section className="min-h-screen bg-teal-950 py-32 px-6 md:px-20 pointer-events-auto relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-12">
              Why Georgia?
            </h2>
            <div className="h-1 w-24 bg-teal-500 mb-16" />
          </motion.div>

          {/* Cultural Facts */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "8,000 Years",
                subtitle: "Wine Heritage",
                desc: "Georgia is the birthplace of wine. Clay qvevri vessels buried underground have fermented grapes for millennia.",
              },
              {
                title: "Unique Alphabet",
                subtitle: "ქართული",
                desc: "One of only 14 alphabets in the world. Georgian script is a UNESCO Intangible Cultural Heritage.",
              },
              {
                title: "Polyphonic Song",
                subtitle: "Three-Part Harmony",
                desc: "Ancient choral tradition recognized by UNESCO. Georgian polyphony predates written music.",
              },
            ].map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="bg-black/40 p-8 rounded-lg border border-teal-500/20"
              >
                <h3 className="text-4xl md:text-5xl font-black text-teal-400 mb-2">
                  {fact.title}
                </h3>
                <p className="text-sm font-mono uppercase tracking-widest text-teal-300/70 mb-4">
                  {fact.subtitle}
                </p>
                <p className="text-base text-white leading-relaxed">
                  {fact.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions Journey */}
      <section className="min-h-screen bg-slate-950 py-32 px-6 md:px-20 pointer-events-auto">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              Seven Kingdoms
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl">
              From the Black Sea coast to the highest peaks of Europe, each region tells its own story.
            </p>
          </motion.div>

          {/* Region Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Kakheti", desc: "Wine country. Endless vineyards stretch beneath mountain ranges.", color: "from-amber-600 to-orange-700" },
              { name: "Svaneti", desc: "Land of towers. Europe's highest inhabited villages defend ancient traditions.", color: "from-slate-600 to-gray-700" },
              { name: "Adjara", desc: "Subtropical paradise. Mountains cascade into the Black Sea.", color: "from-emerald-600 to-teal-700" },
              { name: "Tusheti", desc: "Remote highlands. Accessible only 3 months a year.", color: "from-green-600 to-lime-700" },
              { name: "Kazbegi", desc: "Glacial peaks. Where Prometheus was chained.", color: "from-cyan-600 to-blue-700" },
              { name: "Imereti", desc: "Golden Fleece country. Limestone caves and waterfalls.", color: "from-teal-600 to-cyan-700" },
              { name: "Racha", desc: "Highland forests. Birthplace of legendary Khvanchkara wine.", color: "from-red-600 to-rose-700" },
            ].map((region, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${region.color} rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                <div className="relative bg-slate-900 p-8 rounded-lg border border-white/10 hover:border-white/30 transition-all h-full">
                  <h3 className="text-3xl font-black text-white mb-4">
                    {region.name}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {region.desc}
                  </p>
                  <div className={`mt-6 h-1 w-16 bg-gradient-to-r ${region.color} group-hover:w-full transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="min-h-screen bg-stone-900 py-32 px-6 md:px-20 pointer-events-auto">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-stone-300 max-w-2xl mx-auto">
              We're not a tour operator. We're cultural conservators.
            </p>
          </motion.div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Small Groups Only",
                desc: "Maximum 8 travelers. We preserve the intimacy of discovery and minimize our footprint.",
              },
              {
                title: "Local Guides",
                desc: "Every guide is Georgian. They don't just know the history—they lived it.",
              },
              {
                title: "Sustainable Travel",
                desc: "We partner with family-run guesthouses and support traditional crafts. Tourism should sustain, not extract.",
              },
              {
                title: "Authentic Experiences",
                desc: "No tourist traps. We take you to working monasteries, real qvevri cellars, and villages where tourism hasn't arrived yet.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-black/30 p-10 rounded-lg border border-stone-700/30"
              >
                <h3 className="text-2xl font-black text-stone-200 mb-4">
                  {value.title}
                </h3>
                <p className="text-lg text-white leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-32 pointer-events-auto">
        <div className="text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black text-white mb-8">
              Ready to Explore?
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
              Let's plan your Georgian journey. Small groups, deep experiences, unforgettable memories.
            </p>
            <a
              href="mailto:commune@voyage.ge"
              className="inline-block px-12 py-6 bg-teal-700 hover:bg-teal-600 text-white text-lg font-semibold tracking-wide transition-all rounded-md hover:scale-105"
            >
              commune@voyage.ge
            </a>
            <p className="mt-8 text-sm text-slate-500 font-mono">
              EST. 2024 · TBILISI, GEORGIA
            </p>
          </motion.div>
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
