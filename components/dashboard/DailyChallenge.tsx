"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";

const PROBLEMS = [
  { q: "Solve for x: 2x + 5 = 13", a: "4" },
  { q: "What is the square root of 144?", a: "12" },
  { q: "3(x - 2) = 15. Find x.", a: "7" },
  { q: "Evaluate: 2^3 * 3", a: "24" },
];

export default function DailyChallenge() {
  const [problemIdx, setProblemIdx] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setProblemIdx(Math.floor(Math.random() * PROBLEMS.length));
  }, []);

  if (problemIdx === null) return null;

  const problem = PROBLEMS[problemIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === problem.a) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col h-full border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Daily Sprint</h3>
        </div>
        <div className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">+50 XP</div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <p className="text-lg font-bold text-white mb-6 font-headline leading-tight">
          {problem.q}
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <motion.div
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              value={value}
              onChange={(e) => {
                  setValue(e.target.value);
                  if (status === "wrong") setStatus("idle");
              }}
              disabled={status === "correct"}
              placeholder="Enter answer..."
              className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-white placeholder:text-white/20 transition-all outline-none font-bold ${
                status === "correct" 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : status === "wrong"
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.06]"
              }`}
            />
          </motion.div>
          
          <AnimatePresence>
            {status === "idle" && value.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                type="submit"
                className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 shadow-xl transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === "correct" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </motion.div>
            )}
            {status === "wrong" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <XCircle className="w-6 h-6 text-red-400" />
                </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {status === "correct" && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs font-bold text-emerald-400/80 text-center tracking-wide"
        >
          Brilliant! Streak increased to 13.
        </motion.p>
      )}
    </div>
  );
}

