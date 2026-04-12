"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THOUGHTS = [
  "Analyzing Algebra proficiency...",
  "Spaced Repetition due for Geometry: Angles.",
  "Logic pattern detected in Linear Equations.",
  "Cognitive load balancing active.",
  "Optimizing for 8th Grade curriculum alignment.",
  "Student accuracy trend: +12% this week.",
  "Semantic understanding of 'variables' identified.",
  "Preparing tailored challenge for Equations...",
  "System integrity: Operational.",
];

export default function IntelligencePulse() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THOUGHTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border border-white/5 p-4 rounded-3xl overflow-hidden min-h-[120px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]" />
        <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Intelligence Pulse</span>
      </div>
      
      <div className="flex-1 relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-sm font-medium text-slate-300 font-mono leading-relaxed italic"
          >
            &gt; {THOUGHTS[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex gap-1 justify-end">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-6 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              animate={i === index % 3 ? { x: ["-100%", "100%"] } : { x: "-100%" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-indigo-500/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
