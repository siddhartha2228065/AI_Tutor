"use client";

import Image from "next/image";
import { useTelemetryStore } from "@/hooks/useTelemetryStore";
import MasteryRadar from "@/components/dashboard/MasteryRadar";
import IntelligencePulse from "@/components/dashboard/IntelligencePulse";
import LearningTimeline from "@/components/dashboard/LearningTimeline";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import VoiceWaveform from "@/components/dashboard/VoiceWaveform";

export default function DashboardPage() {
  const telemetry = useTelemetryStore();
  
  if (!telemetry.isHydrated) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-2 w-full min-h-screen text-slate-200">
      {/* Welcome & Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
        <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
              Welcome back to <span className="text-indigo-400">Cuemath.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              You&apos;ve achieved a <span className="text-indigo-400 font-bold">{telemetry.masteryScore}%</span> mastery score. Your AI Tutor is ready to dive into{" "}
              <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-4">Grade 8 Algebra Foundations</span> whenever you are.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-3xl border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Learning Path Progress</h3>
               <span className="text-[10px] font-bold text-indigo-400">72% Completed</span>
             </div>
             <LearningTimeline />
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* AI Tutor Status with Waveform */}
          <div className="glass-card p-6 rounded-3xl flex items-center justify-between border-white/5 bg-indigo-500/[0.02] relative group cursor-default overflow-hidden">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-white font-bold text-sm">AI Tutor Active</p>
              </div>
              <p className="text-indigo-400/50 text-[11px] font-medium">&quot;Analyzing your patterns...&quot;</p>
            </div>
            <VoiceWaveform />
            <div className="absolute inset-0 bg-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="glass-card p-4 rounded-3xl border-white/5 bg-indigo-500/[0.02] relative overflow-hidden flex flex-col items-center">
            <h3 className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Cognitive Balance</h3>
            <MasteryRadar data={telemetry.cognitiveProfile} />
          </div>
          <IntelligencePulse />
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Activity */}
        <div className="md:col-span-12 lg:col-span-8 glass-card rounded-3xl p-8 flex flex-col min-h-[400px] border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-white font-headline">Weekly Study Hours</h3>
              <p className="text-slate-500 text-sm">Engagement tracking this week</p>
            </div>
            <div className="flex gap-2 text-indigo-400 font-bold text-sm items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Active Cycle
            </div>
          </div>
          <div className="flex-1 flex items-end gap-3 px-4 pb-4">
            {telemetry.weeklyActivity.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">{stat.hours}h</span>
                <div 
                  className="w-full bg-indigo-500/10 border border-white/5 rounded-t-xl transition-all duration-700 group-hover:bg-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] relative overflow-hidden"
                  style={{ height: `calc(${Math.max(10, parseInt(stat.height.match(/\d+/)?.[0] || '10'))} * 3px)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-indigo-400 transition-colors">{stat.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Challenge & Briefings */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          <DailyChallenge />
          
          <div className="glass-card rounded-3xl p-6 flex flex-col border-white/5 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-indigo-400">history</span>
              <h3 className="text-lg font-bold text-white font-headline">Tutor Briefings</h3>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
              {telemetry.tutorBriefings.length === 0 ? (
                 <p className="text-slate-500 text-sm italic">No recent sessions found.</p>
              ) : (
                  telemetry.tutorBriefings.map((item, idx) => (
                    <div key={idx} className="bg-white/[0.03] hover:bg-white/[0.08] p-4 rounded-2xl flex items-start gap-4 transition-all active:scale-95 cursor-pointer border border-white/5 hover:border-white/10 group">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} bg-opacity-20 border border-white/10 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-white text-base">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white leading-tight line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">{item.desc}</p>
                        <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-tight">{item.meta}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="md:col-span-12 lg:col-span-6 glass-card rounded-3xl p-8 border-white/5 bg-emerald-500/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-headline">Upcoming Live Sessions</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">3 Scheduled</span>
          </div>
          <div className="space-y-4">
            {telemetry.upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${lesson.bg} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-sm">event</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{lesson.topic}</p>
                    <p className="text-[10px] text-slate-500 font-medium">with {lesson.tutor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">{lesson.time}</p>
                  <p className="text-[9px] text-emerald-400 uppercase font-black">Joining soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peer Challenges */}
        <div className="md:col-span-12 lg:col-span-6 glass-card rounded-3xl p-8 border-white/5 bg-rose-500/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-headline">Peer Challenges</h3>
            <span className="material-symbols-outlined text-rose-500">trophy</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {telemetry.socialChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center gap-3">
                <img src={challenge.avatar} alt={challenge.user} className="w-8 h-8 rounded-full border border-white/10" />
                <div>
                  <p className="text-xs font-bold text-white">{challenge.user}</p>
                  <p className="text-[10px] text-rose-400 font-black">{challenge.score} XP</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-500/20">
            Invite Friends
          </button>
        </div>

        {/* Continue Learning */}
        <div className="md:col-span-12 space-y-8 pt-10">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-black text-white font-headline">Continue Exploration</h3>
              <p className="text-slate-500 font-medium">Pick up where you left off in your personalized learning path</p>
            </div>
            <div className="text-indigo-400 font-bold text-sm flex items-center gap-2 group cursor-default">
              AI Curriculum Roadmap <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {telemetry.coursesProgress.map((course, idx) => (
              <div key={idx} className="glass-card rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 border border-white/5 hover:border-indigo-500/30">
                <div className="h-48 relative overflow-hidden">
                  <Image fill alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0" src={course.src} sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 text-[10px] text-white rounded-full font-black uppercase tracking-widest ${course.bg} bg-opacity-80 backdrop-blur-md`}>{course.grade}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold text-white mb-5 font-headline">{course.title}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>Module Proficiency</span>
                      <span className="text-indigo-400">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${course.bg} shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000`} style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={telemetry.seedMockData}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40 group border border-indigo-400/30 overflow-hidden"
        title="Seed Mock Data"
      >
        <span className="material-symbols-outlined text-3xl group-hover:hidden" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="material-symbols-outlined text-3xl hidden group-hover:block animate-bounce">smart_toy</span>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>
    </div>
  );
}
