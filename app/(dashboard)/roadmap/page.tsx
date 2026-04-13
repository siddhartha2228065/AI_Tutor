"use client";

import { useTelemetryStore } from "@/hooks/useTelemetryStore";
import { ChevronRight, Target, Flame, CheckCircle2, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const telemetry = useTelemetryStore();
  const roadmap = telemetry.currentRoadmap;

  if (!telemetry.isHydrated) return <div className="p-8 text-white">Loading curriculum...</div>;

  if (!roadmap) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 animate-pulse">
           <span className="material-symbols-outlined text-4xl text-slate-500">map</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 font-headline">No Active Roadmap</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Complete a tutor screening and click "Generate Learning Roadmap" on a candidate record to create a custom pedagogical growth plan.
        </p>
        <Link href="/tutor" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          Go to Screener
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 xl:p-12 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col gap-10 text-slate-200">
      
      {/* Header Panel */}
      <div className="relative p-10 rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-900 via-slate-900 to-black shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Personalized Curriculum</span>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">AI Generated</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 font-headline">
                {roadmap.title}
              </h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed flex items-center gap-2">
                Curated for <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-4">{roadmap.candidateName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-6 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Duration</p>
                  <p className="text-xl font-black text-white">4 Weeks</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Target</p>
                  <p className="text-xl font-black text-white">Math pedagogy Master</p>
               </div>
            </div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Roadmap Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-4 relative">
        
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute left-[12.5%] top-40 bottom-40 w-1 bg-gradient-to-b from-indigo-500/20 via-indigo-500 to-indigo-500/20 z-0" />

        {roadmap.weeks.map((week, idx) => (
          <div key={idx} className="relative z-10 group">
             {/* Week Indicator */}
             <div className="mb-8 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                  idx === 0 ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)] scale-110' : 'bg-slate-900 border-white/5 group-hover:border-indigo-500/50'
                }`}>
                   <span className="text-xl font-black text-white">{week.week}</span>
                </div>
                <div className="mt-4 text-center">
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">Week {week.week}</h3>
                </div>
             </div>

             {/* Content Card */}
             <div className={`glass-card rounded-[2rem] p-8 flex flex-col h-full border-t-4 transition-all duration-500 group-hover:-translate-y-2 ${
               idx === 0 ? 'border-t-indigo-500 ring-1 ring-white/10 shadow-2xl' : 'border-t-transparent border-white/5'
             }`}>
                <div className="mb-6 flex items-start justify-between">
                   <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{week.focus}</p>
                   {idx === 0 && <span className="bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded italic animate-pulse">ACTIVE_PHASE</span>}
                </div>

                <div className="space-y-4 flex-1">
                   {week.topics.map((topic, tIdx) => (
                     <div key={tIdx} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="material-symbols-outlined text-indigo-400 text-lg">{topic.icon}</span>
                           <p className="text-white font-bold text-sm">{topic.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{topic.desc}</p>
                     </div>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                         <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Learning Outcome</p>
                   </div>
                   <p className="text-white font-bold text-sm italic leading-snug">"{week.outcome}"</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="mt-12 flex justify-center">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
             <div className="flex items-center gap-6 px-6">
                <div className="flex items-center gap-2">
                   <Flame className="w-5 h-5 text-orange-500" />
                   <p className="text-white font-black">Day 1 / 28</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                   Total Progression: <span className="text-indigo-400 font-black font-mono">5%</span>
                </div>
             </div>
             <button className="px-8 py-3 bg-white text-indigo-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Start Next Chapter
             </button>
          </div>
      </div>

    </div>
  );
}
