"use client";

import { useTelemetryStore } from "@/hooks/useTelemetryStore";
import { Download, ChevronRight, Info } from "lucide-react";

export default function AnalyticsPage() {
  const telemetry = useTelemetryStore();
  
  if (!telemetry.isHydrated) return <div className="p-8 text-white">Loading intelligence suite...</div>;

  const handleDownloadCSV = () => {
    const headers = ["Title", "Context", "Performance", "Date"];
    const rows = telemetry.tutorBriefings.map(b => [
      `"${b.title}"`, 
      `"${b.desc}"`, 
      `"${b.meta}"`, 
      new Date().toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuemath_intelligence_metrics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topics = [
    { name: "Algebra", mastery: 92, status: "Expert" },
    { name: "Calculus", mastery: 45, status: "Learning" },
    { name: "Geometry", mastery: 78, status: "Advanced" },
    { name: "Trig", mastery: 64, status: "Steady" },
    { name: "Statistics", mastery: 30, status: "Beginner" },
    { name: "Logic", mastery: 85, status: "Expert" },
    { name: "Arithmetic", mastery: 98, status: "Master" },
    { name: "Functions", mastery: 55, status: "Steady" },
  ];

  const badges = [
    { name: "Algebra Ace", icon: "functions", color: "bg-indigo-500", glow: "shadow-indigo-500/40" },
    { name: "30 Day Streak", icon: "local_fire_department", color: "bg-orange-500", glow: "shadow-orange-500/40" },
    { name: "Geometry Guru", icon: "change_history", color: "bg-teal-500", glow: "shadow-teal-500/40" },
    { name: "Late Night Learner", icon: "dark_mode", color: "bg-slate-700", glow: "shadow-slate-700/40" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 xl:p-12 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col gap-10 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight mb-3">
            Intelligence <span className="text-indigo-400">Suite</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
            Real-time pedagogical metrics and performance insights derived from your AI sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadCSV}
            className="px-6 py-3 glass-button rounded-2xl flex items-center gap-2 text-sm font-bold text-white group"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            Download CSV
          </button>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            Full Evaluation Report
          </button>
        </div>
      </div>

      {/* Top Value Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Total Study Hours", value: telemetry.totalStudyHours, unit: "h", icon: "schedule", color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Concepts Mastered", value: telemetry.conceptsMastered, unit: "", icon: "school", color: "text-teal-400", bg: "bg-teal-500/10" },
          { label: "Current Streak", value: telemetry.currentStreak, unit: "Days", icon: "local_fire_department", color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Global Rank", value: telemetry.globalRank, unit: "", icon: "emoji_events", color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((widget, i) => (
          <div key={i} className="glass-card rounded-3xl p-7 flex items-center justify-between group hover:-translate-y-1 transition-all">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{widget.label}</p>
              <h2 className="text-4xl font-black text-white">
                {widget.value}
                {widget.unit && <span className="text-lg text-slate-500 ml-1 font-bold">{widget.unit}</span>}
              </h2>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${widget.bg} ${widget.color} flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5 shadow-inner`}>
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{widget.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-2">
        
        {/* Left: Main Chart */}
        <div className="xl:col-span-2 glass-card rounded-3xl p-10 flex flex-col h-[520px]">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-2xl font-black text-white font-headline mb-2">Weekly Cognitive Load</h3>
              <p className="text-slate-500 font-medium">Distribution of deep learning engagement over time</p>
            </div>
            <button className="px-5 py-2.5 glass-button rounded-xl font-black text-indigo-400 flex items-center gap-2 text-xs uppercase tracking-widest">
              Live Feed <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            </button>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 relative pb-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
              {[0, 1, 2, 3, 4].map((line) => (
                <div key={line} className="w-full h-px bg-white/20"></div>
              ))}
            </div>
            
            {telemetry.weeklyActivity.map((stat, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end z-10 group">
                <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all -translate-y-4 group-hover:-translate-y-8 duration-500">
                  <div className="bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-2xl relative">
                    {stat.hours}h
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45" />
                  </div>
                </div>
                
                <div 
                  className="w-full max-w-[50px] bg-indigo-500/10 border-x border-t border-white/5 rounded-t-2xl group-hover:bg-indigo-600 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-700 relative overflow-hidden"
                  style={{ height: `calc(${Math.max(5, parseInt(stat.height.match(/\d+/)?.[0] || '5'))}%)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-[10%] bg-white/20 blur-sm group-hover:bg-white/40" />
                </div>
                
                <span className="mt-6 font-black text-slate-500 group-hover:text-indigo-400 transition-colors text-[10px] uppercase tracking-widest">
                  {stat.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Badges & Rewards */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-black rounded-3xl p-10 shadow-2xl shadow-indigo-900/40 text-white flex flex-col border border-indigo-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black font-headline">Achievements</h3>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10">
                <span className="material-symbols-outlined text-white text-xl">military_tech</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              {badges.map((badge, idx) => (
                <div key={idx} className="bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center transition-all cursor-pointer border border-white/5 group hover:scale-[1.02] active:scale-95">
                  <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center shadow-xl ${badge.glow} group-hover:shadow-2xl group-hover:scale-110 transition-all border border-white/20`}>
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {badge.icon}
                    </span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider leading-tight text-white/80 group-hover:text-white">{badge.name}</span>
                </div>
              ))}
            </div>
            
            <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black mt-10 hover:bg-slate-50 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm">
              View Reward Dashboard
            </button>
          </div>
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* NEW: Topic Mastery Heatmap Section */}
      <section className="glass-card rounded-3xl p-10 mt-2 mb-10 border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h3 className="text-2xl font-black text-white font-headline mb-2">Pedagogical Topic Heatmap</h3>
            <p className="text-slate-500 font-medium italic">&quot;Visualizing the depth of your mathematical intuition across domains.&quot;</p>
          </div>
          <div className="flex items-center gap-6 px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/5">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-800 border border-white/10" />
                <span className="text-[10px] font-black uppercase text-slate-500">Low</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <span className="text-[10px] font-black uppercase text-slate-500">Mastered</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {topics.map((topic, i) => (
            <div key={i} className="flex flex-col gap-3 group">
              <div 
                className="aspect-square glass-card rounded-2xl p-1 relative overflow-hidden group-hover:-translate-y-2 transition-all duration-500"
              >
                <div 
                  className="w-full h-full rounded-xl transition-all duration-700" 
                  style={{ 
                    backgroundColor: `rgba(99, 102, 241, ${topic.mastery / 100})`,
                    boxShadow: topic.mastery > 70 ? `0 0 40px rgba(99, 102, 241, ${(topic.mastery - 50) / 100})` : 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white font-black text-xl">{topic.mastery}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest truncate">{topic.name}</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{topic.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

