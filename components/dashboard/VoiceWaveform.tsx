"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const BARS = 8;

export default function VoiceWaveform() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-[3px] h-8 cursor-pointer px-2"
    >
      {[...Array(BARS)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={{ 
            height: isHovered 
              ? [12, 32, 16, 28, 12][i % 5] // Spiked state heights
              : [8, 16, 12, 20, 10][i % 5], // Ambient state heights
            opacity: isHovered ? [0.8, 1, 0.8] : [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: isHovered ? 0.3 : 1.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.1
          }}
          className="w-[3px] bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      ))}
    </div>
  );
}
