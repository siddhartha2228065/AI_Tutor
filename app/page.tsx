"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HLSVideoPlayer } from "@/components/HLSVideoPlayer";
import Link from "next/link";
import { Activity, ShieldCheck, Zap, ChevronDown } from "lucide-react";
const WORD_CYCLE = ["Screener", "Educator", "Interviewer", "Evaluator"];

export default function MainLandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORD_CYCLE.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const badgeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: i === 1 ? [0, -5, 0] : 0,
      transition: {
        y: i === 1 ? {
          delay: 0.1 * i + 0.3,
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut" as any
        } : {
          delay: 0.1 * i + 0.3,
          duration: 0.6,
          ease: "easeOut" as any
        },
        opacity: {
          delay: 0.1 * i + 0.3,
          duration: 0.6
        }
      }
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8, ease: "easeOut" as any } },
  };

  const subtextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.8, ease: "easeOut" as any } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.8, ease: "easeOut" as any } },
  };

  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col font-sans">
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        {/* Logo */}
        <div className="text-white font-black text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            C
          </span>
          Cuemath AI
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 border border-white/10 rounded-full px-8 py-3 bg-white/[0.02]">
          <Link href="/dashboard" className="text-white text-sm font-medium hover:text-white/80 transition-colors">
            Dashboard
          </Link>
          <Link href="/tutor" className="text-white text-sm font-medium hover:text-white/80 transition-colors bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 border-b border-indigo-400 pb-0.5">
            AI Screener
          </Link>
          <Link href="/studio" className="text-white/60 text-sm hover:text-white transition-colors">
            Data Studio
          </Link>
        </div>

        {/* CTA */}
        <Link href="/dashboard" className="bg-gradient-to-tr from-gray-200 to-white text-black font-semibold text-sm px-6 py-2.5 rounded-full hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-shadow">
          Go To Workspace
        </Link>
      </nav>

      {/* 2. Background Video & Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        
        <HLSVideoPlayer
          src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
          className="absolute bottom-[-35vh] left-0 w-full h-[80vh] opacity-100 mix-blend-screen"
        />
        {/* Soft gradient mask to blend video edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black z-10" />
      </div>

      {/* 3. Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 mt-24 text-center">
        
        {/* Badges */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { Icon: Zap, text: "Vercel SDK" },
            { Icon: ShieldCheck, text: "Gemini 2.0" },
            { Icon: Activity, text: "Live Metrics" }
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={badgeVariants}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full bg-white/[0.03] backdrop-blur-md shadow-2xl text-white/80 text-xs font-semibold uppercase tracking-wider hover:bg-white/[0.08] transition-colors cursor-default"
            >
              <span className="text-white/40">Integrated with</span>
              <item.Icon className="w-3.5 h-3.5" />
              <span className="text-white">{item.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Headline */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="relative"
        >
          <h1 className="text-5xl md:text-7xl lg:text-[72px] font-black text-white tracking-tighter leading-[1.1] max-w-5xl">
            The Ultimate <br /> 
            <span className="inline-flex h-[1.1em] items-center text-indigo-400">AI&nbsp;
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORD_CYCLE[index]}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {WORD_CYCLE[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={subtextVariants}
          className="mt-8 text-white/50 text-lg md:text-xl max-w-2xl font-medium leading-relaxed"
        >
          Evaluate math tutor candidates instantly with our state-of-the-art conversational AI. 
          Experience zero-latency intelligence and real-time pedagogical analytics designed for scale.
        </motion.p>

        {/* Buttons & Trust Cluster */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={buttonVariants}
          className="flex flex-col items-center gap-8 mt-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/tutor" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Try AI Screener Now
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white/[0.05] border border-white/5 text-white/90 font-medium rounded-full backdrop-blur-md hover:bg-white/[0.1] transition-all hover:scale-105 active:scale-95 shadow-xl">
              Enter Dashboard
            </Link>
          </div>

          {/* Avatar Trust Cluster */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                  <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
                +1k
              </div>
            </div>
            <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase">
              Trusted by 500+ educators worldwide
            </p>
          </div>
        </motion.div>

      </main>

      {/* 6. Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </motion.div>





    </div>
  );
}
