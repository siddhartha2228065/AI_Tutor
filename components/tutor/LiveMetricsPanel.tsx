import { ScreenerMetrics, VideoMetrics } from "@/hooks/useScreenerLogic";

interface Props {
  metrics: ScreenerMetrics;
  candidateMessages: number;
  timer: number;
  interviewEnded: boolean;
  formatTime: (s: number) => string;
  endInterview: () => void;
  videoMetrics?: VideoMetrics;
  isVideoEnabled?: boolean;
}

export default function LiveMetricsPanel({
  metrics,
  candidateMessages,
  timer,
  interviewEnded,
  formatTime,
  endInterview,
  videoMetrics,
  isVideoEnabled,
}: Props) {
  return (
    <div className="w-80 border-l border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col flex-shrink-0 hidden lg:flex shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-slate-900/30">
        <h3 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Telemetry</h3>
        <p className="text-cyan-500/70 text-[10px] mt-1 font-mono">LIVE_AGENT_MONITORING</p>
      </div>

      <div className="p-6 flex flex-col gap-8 flex-1">
        {[
          { key: "clarity", label: "Clarity Index", color: "from-indigo-400 to-blue-400" },
          { key: "engagement", label: "Engagement Rating", color: "from-cyan-400 to-teal-400" },
          { key: "patience", label: "Patience Threshold", color: "from-amber-400 to-orange-400" },
          { key: "adaptability", label: "Reactive Adaptation", color: "from-rose-400 to-pink-400" },
        ].map((m) => {
          const value = metrics[m.key as keyof ScreenerMetrics];
          return (
            <div key={m.key}>
              <div className="flex justify-between text-xs mb-2 font-mono">
                <span className="text-slate-400 uppercase tracking-widest">{m.label}</span>
                <span className="text-white font-bold">{value}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-700 shadow-[0_0_10px_currentColor]`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
        {isVideoEnabled && videoMetrics && (
          <div className="border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              <span className="text-emerald-300 text-[10px] font-bold font-mono tracking-widest uppercase">Vision Analysis</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {[
              { key: "eyeContact", label: "Eye Contact", color: "from-emerald-400 to-teal-400", icon: "visibility" },
              { key: "gestures", label: "Hand Gestures", color: "from-violet-400 to-purple-400", icon: "gesture" },
              { key: "smileFrequency", label: "Smile / Warmth", color: "from-amber-400 to-yellow-400", icon: "sentiment_satisfied" },
              { key: "posture", label: "Posture", color: "from-sky-400 to-blue-400", icon: "accessibility_new" },
            ].map((m) => {
              const value = videoMetrics[m.key as keyof VideoMetrics];
              return (
                <div key={m.key} className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px]">{m.icon}</span>
                      {m.label}
                    </span>
                    <span className="text-white font-bold text-[10px]">{value}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto border-t border-white/5 pt-6">
          <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>troubleshoot</span>
              <span className="text-cyan-300 text-xs font-bold font-mono tracking-widest">DIAGNOSTICS</span>
            </div>
            <div className="space-y-3 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span>DATA_PACKETS</span>
                <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded">{candidateMessages}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span>LIFESPAN</span>
                <span className={`font-bold bg-white/5 px-2 py-0.5 rounded ${timer < 120 ? 'text-rose-400' : 'text-white'}`}>{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ALGORITHM</span>
                <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded">
                  {candidateMessages === 0 ? "IDLE" :
                   candidateMessages <= 3 ? "WARMUP" :
                   candidateMessages <= 8 ? "LOAD_TEST" :
                   candidateMessages <= 12 ? "SCENARIO" : "CRITICAL"}
                </span>
              </div>
            </div>
          </div>

          {!interviewEnded && candidateMessages >= 2 && (
            <button
              onClick={endInterview}
              className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">sim_card_download</span>
              Force Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
