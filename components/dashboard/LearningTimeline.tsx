"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, label: "Basics", status: "complete" },
  { id: 2, label: "Expressions", status: "complete" },
  { id: 3, label: "Equations", status: "active" },
  { id: 4, label: "Functions", status: "upcoming" },
  { id: 5, label: "Final Exam", status: "upcoming" },
];

export default function LearningTimeline() {
  return (
    <div className="w-full py-8">
      <div className="relative flex items-center justify-between">
        {/* Background Rail */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5" />
        
        {/* Progress Rail */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-500 shadow-[0_0_10px_#6366f1]" 
        />

        {STEPS.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * idx, type: "spring" }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                step.status === "complete"
                  ? "bg-indigo-500 border-indigo-500 shadow-[0_0_15px_#6366f1]"
                  : step.status === "active"
                  ? "bg-slate-900 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse"
                  : "bg-slate-950 border-white/5"
              }`}
            >
              {step.status === "complete" ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <span className={`text-[10px] font-black ${step.status === "active" ? "text-indigo-400" : "text-white/20"}`}>
                  {step.id}
                </span>
              )}
            </motion.div>
            
            <div className="absolute -bottom-6 flex flex-col items-center w-max">
              <span className={`text-[10px] uppercase tracking-tighter font-bold ${
                step.status === "upcoming" ? "text-white/20" : "text-white/60"
              }`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
