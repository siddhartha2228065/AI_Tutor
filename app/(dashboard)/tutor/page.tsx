"use client";

import { useToast } from "@/components/Toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useScreenerLogic } from "@/hooks/useScreenerLogic";
import AntiGravitySphere from "@/components/AntiGravitySphere";
import AudioVisualizer from "@/components/AudioVisualizer";

import PreStartScreen from "@/components/tutor/PreStartScreen";
import LiveMetricsPanel from "@/components/tutor/LiveMetricsPanel";

export default function TutorScreenerPage() {
  const { showToast } = useToast();
  const { state, refs, actions } = useScreenerLogic(showToast);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const downloadReport = async () => {
    if (!refs.reportRef.current) return;
    showToast("Preparing your PDF report...", "info");
    const element = refs.reportRef.current;
    element.classList.add("export-pdf-mode");
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cuemath_Interview_Report_${Date.now()}.pdf`);
      showToast("Report downloaded successfully!", "success");
    } catch (e) {
      showToast("Failed to generate PDF.", "error");
    } finally {
      element.classList.remove("export-pdf-mode");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); actions.handleSend(); }
  };

  const candidateMessages = state.dialogue.filter((m) => !m.isAi).length;
  const agentActive = state.isAiTalking || state.isThinking;

  if (!state.interviewStarted) {
    return <PreStartScreen startInterview={actions.startInterview} />;
  }

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-950 text-slate-200 relative">
      <style jsx global>{`
        .mic-pulse { animation: mic-glow 1.8s infinite; }
        @keyframes mic-glow {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.7); }
          70% { box-shadow: 0 0 0 20px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        .wave-bar { width: 3px; border-radius: 10px; animation: wave 1s ease-in-out infinite; }
        .wave-bar:nth-child(1) { height: 40%; animation-delay: 0.1s; }
        .wave-bar:nth-child(2) { height: 70%; animation-delay: 0.2s; }
        .wave-bar:nth-child(3) { height: 100%; animation-delay: 0.3s; }
        .wave-bar:nth-child(4) { height: 60%; animation-delay: 0.4s; }
        .wave-bar:nth-child(5) { height: 30%; animation-delay: 0.5s; }
        @keyframes wave { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.6); } }
        .report-content h2 { font-size: 1.2rem; font-weight: 800; color: #c7d2fe; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .report-content strong { color: #a5b4fc; }
        .report-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .report-content li { margin-bottom: 0.3rem; color: #cbd5e1; }
        .report-content p { color: #cbd5e1; margin: 0.4rem 0; line-height: 1.6; }
        @keyframes sphere-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>

      {/* Main Chat Area — now full width with sphere integrated */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 relative backdrop-blur-sm shadow-xl">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Agent status indicator in header */}
            <div className={`w-3 h-3 rounded-full animate-pulse ${state.isThinking ? 'bg-cyan-400' : state.isAiTalking ? 'bg-amber-400' : state.isListening ? 'bg-indigo-400' : 'bg-slate-500'}`} />
            <div>
              <h2 className="font-headline font-bold text-white text-lg leading-none">Nexus Dialogue</h2>
              <p className="text-cyan-400/80 text-xs mt-0.5 font-mono">
                {state.isThinking ? "PROCESSING_DIRECTIVE..." : state.isAiTalking ? "AI_TRANSMITTING..." : state.isListening ? "AUDIO_FEED_ACTIVE" : "ENCRYPTED_LINK_ESTABLISHED"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-mono font-bold text-sm flex items-center gap-2 ${state.timer < 120 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
              <span className="material-symbols-outlined text-[16px]">timer</span>
              {formatTime(state.timer)}
            </div>
            {!state.interviewEnded && (
              <button
                onClick={actions.endInterview}
                disabled={candidateMessages < 2}
                className="px-4 py-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/40 rounded-xl text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-30 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">stop_circle</span> End Session
              </button>
            )}
          </div>
        </div>

        {/* Dialogue Feed with Centered Sphere */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-slate-950/20">
          
          {/* ═══ AI Agent Sphere — pinned at top center of chat ═══ */}
          <div className="flex flex-col items-center py-4 sticky top-0 z-20">
            {/* Aura glow behind */}
            <div className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] transition-all duration-700 ${
              state.isAiTalking ? 'bg-amber-500/30 scale-110' : 
              state.isThinking ? 'bg-cyan-500/25 scale-95 animate-pulse' : 
              state.isListening ? 'bg-indigo-500/20 scale-100' : 'bg-indigo-600/15 scale-100'
            }`} />
            
            {/* Sphere container */}
            <div className={`relative z-10 rounded-full overflow-hidden border-4 shadow-2xl bg-black transition-all duration-500 ${
              agentActive 
                ? 'w-44 h-44 border-cyan-400/40 shadow-[0_0_60px_rgba(6,182,212,0.3)]' 
                : 'w-32 h-32 border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            }`}
              style={{ animation: agentActive ? 'sphere-breathe 3s ease-in-out infinite' : 'none' }}
            >
              <div style={{ width: agentActive ? '176px' : '128px', height: agentActive ? '176px' : '128px', position: 'relative' }}>
                <AntiGravitySphere isTalking={state.isAiTalking} isThinking={state.isThinking} isListening={state.isListening} />
              </div>
            </div>

            {/* Status chip below sphere */}
            <span className={`mt-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-300 ${
              state.isAiTalking ? 'text-amber-300 border-amber-500/30 bg-amber-900/20' :
              state.isThinking ? 'text-cyan-300 border-cyan-500/30 bg-cyan-900/20' :
              state.isListening ? 'text-indigo-300 border-indigo-500/30 bg-indigo-900/20' :
              'text-slate-500 border-white/10 bg-slate-900/30'
            }`}>
              {state.isThinking ? "Analyzing..." : state.isAiTalking ? "Speaking" : state.isListening ? "Listening" : "Standby"}
            </span>
            
            {/* Audio visualizer when listening */}
            {state.isListening && (
              <div className="mt-3 bg-slate-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <AudioVisualizer stream={state.audioStream} isActive={state.isListening} />
              </div>
            )}
          </div>

          {/* ═══ Chat Messages ═══ */}
          {state.dialogue.map((msg, i) => (
            <div key={i} className={`flex ${msg.isAi ? "justify-start" : "justify-end"}`}>
              {msg.isReport ? (
                <div ref={refs.reportRef} className="w-full max-w-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-900/40">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-indigo-500/20">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>assessment</span>
                    </div>
                    <div>
                      <div className="text-indigo-300 font-bold text-sm">Interview Evaluation Report</div>
                      <div className="text-slate-600 text-xs font-mono">Generated by Nexus Evaluator</div>
                    </div>
                  </div>
                  <div className="report-content" dangerouslySetInnerHTML={{
                    __html: (msg.text || '').replace(/## (.*)/g, '<h2>$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- (.*)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>').replace(/\n/g, '<p></p>')
                  }} />
                  <div className="mt-6 pt-4 border-t border-indigo-500/10 flex justify-end">
                    <button onClick={downloadReport} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                      <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%]">
                  {msg.isAi && (
                    <div className="flex items-center gap-2 mb-1 pl-1">
                      <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest">Sys.Interviewer</span>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl ${msg.isAi ? "bg-slate-800/80 border border-white/5 rounded-tl-none text-slate-200" : "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20"}`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  {!msg.isAi && (
                    <div className="flex justify-end mt-1 pr-1">
                      <span className="text-slate-600 text-[10px] uppercase font-mono tracking-widest">Candidate.01</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {state.isThinking && (
            <div className="flex justify-start">
              <div className="max-w-[75%]">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest">Sys.Interviewer</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1 items-end h-5">
                    {[0, 1, 2, 3, 4].map((i) => <div key={i} className="wave-bar bg-cyan-400" style={{ height: '100%' }} />)}
                  </div>
                  <span className="text-slate-500 text-xs font-mono">PROCESSING_DIRECTIVE...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={refs.dialogueEndRef} />
        </div>

        {/* Input Bar */}
        {!state.interviewEnded && (
          <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={actions.toggleListen}
                disabled={state.isThinking}
                className={`w-14 h-14 flex-shrink-0 ${state.isListening ? "bg-cyan-600 mic-pulse" : "bg-indigo-600 hover:bg-indigo-500"} text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all`}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{state.isListening ? "mic_off" : "mic"}</span>
              </button>
              <div className="flex-1 relative">
                <input
                  value={state.inputValue}
                  onChange={(e) => actions.setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={state.isThinking}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-5 text-white font-mono text-sm focus:border-cyan-500/50 outline-none placeholder-slate-500 disabled:opacity-40 transition-all"
                  placeholder={state.isListening ? "Listening to your voice..." : "Type response or initialize mic..."}
                />
              </div>
              <button
                onClick={() => actions.handleSend()}
                disabled={state.isThinking || !state.inputValue.trim()}
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-2xl hover:bg-cyan-600 hover:text-white transition-all disabled:opacity-30 active:scale-90"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        )}

        {state.interviewEnded && (
          <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-white/5 bg-slate-900/60 backdrop-blur-md">
            <button onClick={actions.resetSession} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restart_alt</span> Initialize New Session
            </button>
          </div>
        )}
      </div>

      {/* Right Pane */}
      <LiveMetricsPanel
        metrics={state.metrics}
        candidateMessages={candidateMessages}
        timer={state.timer}
        interviewEnded={state.interviewEnded}
        formatTime={formatTime}
        endInterview={actions.endInterview}
      />
    </div>
  );
}
