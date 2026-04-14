"use client";

import AntiGravitySphere from "@/components/AntiGravitySphere";
import { useState, useEffect } from "react";
import { useSound } from "@/hooks/useSound";

interface Props {
  startInterview: () => void;
}

export default function PreStartScreen({ startInterview }: Props) {
  const [step, setStep] = useState<"intro" | "calibrating" | "ready">("intro");
  const [logs, setLogs] = useState<string[]>([]);
  const [typedText, setTypedText] = useState("");
  const { playHover, playClick, playTyping, playSuccess } = useSound();

  const introText = "Hello. I am Nexus. The Cuemath Intelligence engine. Shall we calibrate your neural link?";

  useEffect(() => {
    if (step === "intro") {
      let i = 0;
      setTypedText("");
      const timer = setInterval(() => {
        setTypedText(introText.slice(0, i + 1));
        if (i % 3 === 0) playTyping(); // Play typing sound occasionally
        i++;
        if (i >= introText.length) clearInterval(timer);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [step]);

  const handleCalibrate = () => {
    playClick();
    setStep("calibrating");
    const simulationLogs = [
      "Securing encrypted P2P channel...",
      "Initializing AudioContext...",
      "Requesting optical sensor access...",
      "Optimizing latency thresholds...",
      "Neurolink handshake complete."
    ];
    
    let currentLog = 0;
    const logInterval = setInterval(() => {
      setLogs((prev) => [...prev, simulationLogs[currentLog]]);
      currentLog++;
      if (currentLog >= simulationLogs.length) {
        clearInterval(logInterval);
        setTimeout(() => {
          setStep("ready");
          playSuccess();
        }, 600);
      }
    }, 600);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#050510] relative overflow-hidden h-full min-h-[calc(100svh-140px)] transition-colors duration-500">
      {/* AntiGravitySphere Background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none">
         <AntiGravitySphere isThinking={step === "calibrating"} />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto p-6 md:p-12 text-center bg-white/60 dark:bg-slate-950/70 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl transition-colors duration-500 m-4">
        
        {step === "intro" && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="h-20 flex items-center justify-center mb-8">
              <p className="text-xl md:text-2xl font-mono text-slate-800 dark:text-cyan-400 font-bold tracking-tight min-h-[64px]">
                {typedText}
                <span className="animate-pulse">_</span>
              </p>
            </div>
            <button
              onClick={handleCalibrate}
              onMouseEnter={playHover}
              className="px-8 py-4 bg-slate-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-cyan-600 text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-cyan-600/20 flex items-center justify-center gap-3 w-full"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
              Initiate Calibration
            </button>
            <p className="text-slate-500 dark:text-slate-500 text-[10px] uppercase tracking-widest mt-6 font-bold">
              Requires Microphone & Camera
            </p>
          </div>
        )}

        {step === "calibrating" && (
          <div className="animate-fade-in text-left bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-inner font-mono text-xs w-full min-h-[200px] flex flex-col justify-end">
            <div className="space-y-2 mb-4 text-emerald-400">
              {logs.map((log, i) => (
                <div key={i} className="animate-slide-in-right opacity-80 flex gap-2">
                  <span className="text-slate-600">&gt;</span> {log}
                </div>
              ))}
              {logs.length < 5 && (
                <div className="animate-pulse flex gap-2 opacity-50">
                  <span className="text-slate-600">&gt;</span> _
                </div>
              )}
            </div>
          </div>
        )}

        {step === "ready" && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <h1 className="text-3xl font-headline font-black text-slate-900 dark:text-white mb-2">
              Calibration Complete
            </h1>
            <p className="text-slate-500 mb-8 max-w-sm">
              Your link to the Nexus Agent is ready. Teach naturally, utilize the whiteboard, and receive real-time analytics.
            </p>
            <button
              onClick={() => { playClick(); startInterview(); }}
              onMouseEnter={playHover}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 w-full"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Commence Interview
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
