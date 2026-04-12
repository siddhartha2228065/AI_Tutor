import AntiGravitySphere from "@/components/AntiGravitySphere";

interface Props {
  startInterview: () => void;
}

export default function PreStartScreen({ startInterview }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#050510] relative overflow-hidden h-full min-h-[calc(100vh-80px)]">
      {/* AntiGravitySphere Background */}
      <div className="absolute inset-0 z-0 opacity-60">
         <AntiGravitySphere />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-10 text-center bg-slate-950/70 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)]">
          <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            record_voice_over
          </span>
        </div>
        <div className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          Nexus Agent Link
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-white mt-4 mb-4 tracking-tight">
          Tutor Interview<br />
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Assessment Portal</span>
        </h1>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          You will be interviewed by an advanced AI presence simulating a <strong className="text-slate-300">live student</strong> and <strong className="text-slate-300">evaluator</strong>. Access microphone, teach naturally, and receive a performance report.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: "timer", label: "10 Min", desc: "Session" },
            { icon: "school", label: "KG–12", desc: "All Levels" },
            { icon: "psychology", label: "AI-Powered", desc: "Analysis" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <span className="material-symbols-outlined text-cyan-400 text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <div className="text-white font-bold">{item.label}</div>
              <div className="text-slate-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={startInterview}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-cyan-600/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          Initialize Link
        </button>
        <p className="text-slate-500 text-xs mt-4">Allow microphone access when prompted</p>
      </div>
    </div>
  );
}
