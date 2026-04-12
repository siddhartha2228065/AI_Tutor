"use client";

import React from "react";
import { motion } from "framer-motion";

interface MasteryRadarProps {
  data: {
    logic: number;
    speed: number;
    accuracy: number;
    persistence: number;
    clarity: number;
  };
}

export default function MasteryRadar({ data }: MasteryRadarProps) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  
  const categories = [
    { key: "logic", label: "Logic", angle: 0 },
    { key: "speed", label: "Speed", angle: 72 },
    { key: "accuracy", label: "Accuracy", angle: 144 },
    { key: "persistence", label: "Persistence", angle: 216 },
    { key: "clarity", label: "Clarity", angle: 288 },
  ];

  const getPoint = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  if (!data) return null;

  const points = categories.map((cat) => {
    const val = (data as any)[cat.key] || 0;
    const r = (val / 100) * radius;
    const p = getPoint(cat.angle, r);
    return `${p.x},${p.y}`;
  }).join(" ");

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[300px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      </motion.div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10 overflow-visible">
        {/* Grid lines */}
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={categories.map(c => {
              const p = getPoint(c.angle, radius * lvl);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="white"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {categories.map((cat) => {
          const p = getPoint(cat.angle, radius);
          return (
            <line
              key={cat.key}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="white"
              strokeOpacity={0.1}
              strokeDasharray="2,4"
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat) => {
          const p = getPoint(cat.angle, radius + 25);
          return (
            <text
              key={cat.key}
              x={p.x}
              y={p.y}
              fill="white"
              fillOpacity={0.6}
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="uppercase tracking-widest font-sans"
            >
              {cat.label}
            </text>
          );
        })}

        {/* Data Area */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          points={points}
          fill="url(#radarGradient)"
          fillOpacity={0.4}
          stroke="#6366f1"
          strokeWidth={2}
          className="drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        />

        {/* Points */}
        {categories.map((cat) => {
          const val = (data as any)[cat.key] || 0;
          const r = (val / 100) * radius;
          const p = getPoint(cat.angle, r);
          return (
            <circle
              key={cat.key}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#818cf8"
              className="drop-shadow-[0_0_5px_#818cf8]"
            />
          );
        })}

        <defs>
          <radialGradient id="radarGradient">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#818cf8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
