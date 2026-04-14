"use client";

import { useToast } from "@/components/Toast";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { useScreenerLogic } from "@/hooks/useScreenerLogic";
import AntiGravitySphere from "@/components/AntiGravitySphere";
import AudioVisualizer from "@/components/AudioVisualizer";

import PreStartScreen from "@/components/tutor/PreStartScreen";
import LiveMetricsPanel from "@/components/tutor/LiveMetricsPanel";
import Whiteboard from "@/components/tutor/Whiteboard";
import MasteryRadar from "@/components/dashboard/MasteryRadar";
import { useState, useEffect } from "react";
import { useTelemetryStore } from "@/hooks/useTelemetryStore";
import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/useSound";

export default function TutorScreenerPage() {
  const { showToast } = useToast();
  const telemetry = useTelemetryStore();
  const router = useRouter();
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
      const dataUrl = await htmlToImage.toPng(element, { quality: 1, backgroundColor: "#ffffff", style: { transform: "scale(1)", transformOrigin: "top left" } });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (img.height * pdfWidth) / img.width;
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Cuemath_Interview_Report_${Date.now()}.pdf`);
        showToast("Report downloaded successfully!", "success");
      };
    } catch (e: any) {
      console.error(e);
      showToast("Failed to generate PDF: " + (e.message || "Unknown error"), "error");
    } finally {
      element.classList.remove("export-pdf-mode");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); actions.handleSend(); }
  };

  const candidateMessages = state.dialogue.filter((m) => !m.isAi).length;
  const spokenCount = state.dialogue.filter((m) => !m.isAi && m.isSpoken).length;
  const typedCount = state.dialogue.filter((m) => !m.isAi && !m.isSpoken).length;
  const tabSwitches = state.fraudFlags?.filter((f: any) => f.type === "tab_switch").length || 0;
  const fullscreenExits = state.fraudFlags?.filter((f: any) => f.type === "fullscreen_exit").length || 0;
  const totalFraud = tabSwitches + fullscreenExits;
  
  const agentActive = state.isAiTalking || state.isThinking;

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const { playHover, playClick } = useSound();

  // Bind video stream to the video element when it changes
  useEffect(() => {
    if (refs.videoRef.current && state.videoStream) {
      refs.videoRef.current.srcObject = state.videoStream;
    }
  }, [state.videoStream, refs.videoRef]);

  const handleSave = () => {
    const reportMsg = state.dialogue.find(m => m.isReport);
    if (!reportMsg) return;

    telemetry.saveCandidate({
      name: candidateName || "Anonymous Candidate",
      date: new Date().toLocaleDateString(),
      metrics: state.metrics,
      summary: reportMsg.text
    });
    showToast("Candidate saved successfully!", "success");
    setIsSaving(false);
    setCandidateName("");
  };

  const toggleCompare = (id: string) => {
    setComparingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<string | null>(null);

  const handleGenerateRoadmap = async (c: any) => {
    setIsGeneratingRoadmap(c.id);
    try {
      await telemetry.generateRoadmap(c);
      showToast("Pedagogical roadmap generated!", "success");
      router.push("/roadmap");
    } catch (e) {
      showToast("Roadmap generation failed.", "error");
    } finally {
      setIsGeneratingRoadmap(null);
    }
  };

  if (!telemetry.isHydrated) return null;

  if (!state.interviewStarted) {
    return (
      <div className="relative h-full">
        <PreStartScreen startInterview={actions.startInterview} />
        {/* Quick History Access */}
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="fixed bottom-10 left-10 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 text-slate-400 hover:text-white transition-all z-50 shadow-2xl backdrop-blur-md"
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-sm font-bold uppercase tracking-widest">Candidate Records</span>
        </button>

        {isHistoryOpen && (
          <CandidateHistoryPanel 
            candidates={telemetry.candidates}
            onClose={() => setIsHistoryOpen(false)}
            comparingIds={comparingIds}
            onToggleCompare={toggleCompare}
            onGenerateRoadmap={handleGenerateRoadmap}
            isGeneratingRoadmap={isGeneratingRoadmap}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full min-h-[calc(100svh-140px)] lg:h-[calc(100vh-80px)] overflow-hidden bg-slate-950 text-slate-200 relative">
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
            <div className={`w-3 h-3 rounded-full animate-pulse ${state.isThinking ? 'bg-cyan-400' : state.isAiTalking ? 'bg-amber-400' : state.isListening ? 'bg-indigo-400' : 'bg-slate-500'}`} />
            <div>
              <h2 className="font-headline font-bold text-white text-base md:text-lg leading-none">Nexus Dialogue</h2>
              <p className="text-cyan-400/80 text-[9px] md:text-xs mt-0.5 font-mono italic truncate max-w-[120px] md:max-w-none">
                {state.isThinking ? "PROCESSING_DIRECTIVE..." : state.isTranscribing ? "TRANSCRIBING_COMMAND..." : state.isAiTalking ? "AI_TRANSMITTING..." : state.isListening ? "AUDIO_FEED_ACTIVE" : "ENCRYPTED_LINK_ESTABLISHED"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => { playClick(); setIsMetricsOpen(true); }}
              onMouseEnter={playHover}
              className="lg:hidden px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Metrics</span>
            </button>
            <button 
              onClick={() => { playClick(); setIsHistoryOpen(true); }}
              onMouseEnter={playHover}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Records</span>
            </button>
            <button 
              onClick={() => { playClick(); setIsWhiteboardOpen(true); }}
              onMouseEnter={playHover}
              className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit_square</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Board</span>
            </button>
            <button 
              onClick={() => { playClick(); actions.toggleVideo(); }}
              onMouseEnter={playHover}
              className={`px-3 py-2 border rounded-xl transition-all flex items-center gap-2 ${state.isVideoEnabled ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{state.isVideoEnabled ? 'videocam' : 'videocam_off'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{state.isVideoEnabled ? 'Live' : 'Camera'}</span>
            </button>
            <div className={`px-2 md:px-4 py-2 rounded-xl font-mono font-bold text-[10px] md:text-sm flex items-center gap-2 ${state.timer < 120 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">timer</span>
              {formatTime(state.timer)}
            </div>
            {!state.interviewEnded && (
              <button
                onClick={() => { playClick(); actions.endInterview(); }}
                onMouseEnter={playHover}
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
          
          <div className="flex flex-col items-center py-4 sticky top-0 z-20">
            <div className={`absolute w-[300px] h-[300px] rounded-full blur-[100px] transition-all duration-700 ${
              state.isAiTalking ? 'bg-amber-500/30 scale-110' : 
              state.isThinking ? 'bg-cyan-500/25 scale-95 animate-pulse' : 
              state.isListening ? 'bg-indigo-500/20 scale-100' : 'bg-indigo-600/15 scale-100'
            }`} />
            <div className={`relative z-10 rounded-full overflow-hidden border-4 shadow-2xl bg-black transition-all duration-500 ${
              agentActive 
                ? 'w-32 h-32 md:w-44 md:h-44 border-cyan-400/40 shadow-[0_0_60px_rgba(6,182,212,0.3)]' 
                : 'w-24 h-24 md:w-32 md:h-32 border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            }`}
              style={{ animation: agentActive ? 'sphere-breathe 3s ease-in-out infinite' : 'none' }}
            >
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <AntiGravitySphere isTalking={state.isAiTalking} isThinking={state.isThinking} isListening={state.isListening} />
              </div>
            </div>
            <span className={`mt-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-300 ${
              state.isAiTalking ? 'text-amber-300 border-amber-500/30 bg-amber-900/20' :
              state.isThinking ? 'text-cyan-300 border-cyan-500/30 bg-cyan-900/20' :
              state.isListening ? 'text-indigo-300 border-indigo-500/30 bg-indigo-900/20' :
              'text-slate-500 border-white/10 bg-slate-900/30'
            }`}>
              {state.isThinking ? "Analyzing..." : state.isTranscribing ? "Transcribing..." : state.isAiTalking ? "Speaking" : state.isListening ? "Listening" : "Standby"}
            </span>
            {state.isListening && (
              <div className="mt-3 bg-slate-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <AudioVisualizer stream={state.audioStream} isActive={state.isListening} />
              </div>
            )}
          </div>

          {state.dialogue.map((msg, i) => (
            <div key={i} className={`flex ${msg.isAi ? "justify-start" : "justify-end"}`}>
              {msg.isReport ? (
                <div ref={refs.reportRef} className="w-full max-w-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-900/40">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-indigo-500/20">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>assessment</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-indigo-300 font-bold text-sm">Interview Evaluation Report</div>
                      <div className="text-slate-600 text-xs font-mono">Generated by Nexus Evaluator</div>
                    </div>
                    {msg.reportMetrics?.recommendation && (
                       <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                         {msg.reportMetrics.recommendation} ({msg.reportMetrics.confidence}%)
                       </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-2 report-content" dangerouslySetInnerHTML={{
                      __html: (msg.text || '')
                        .replace(/## (.*)/g, '<h2>$1</h2>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^- (.*)/gm, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                        .split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br/>')}</p>` : '').join('')
                    }} />
                    
                    <div className="space-y-6">
                      {msg.reportMetrics && (
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Candidate Attributes</h3>
                          <div className="aspect-square w-full max-w-[240px] mx-auto">
                            <MasteryRadar data={msg.reportMetrics} />
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Integrity & Biometrics</h3>
                         <div className="space-y-3">
                           <div>
                             <div className="text-[10px] text-slate-500 font-mono">PRIMARY INPUT MODE</div>
                             <div className="text-sm font-bold flex items-center gap-2">
                               {spokenCount >= typedCount ? (
                                  <span className="text-emerald-400 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mic</span> Voice Verified ({spokenCount} / {spokenCount + typedCount} turns)</span>
                               ) : (
                                  <span className="text-amber-400 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">keyboard</span> Keyboard Heavy ({typedCount} / {spokenCount + typedCount} turns)</span>
                               )}
                             </div>
                           </div>
                           <div>
                             <div className="text-[10px] text-slate-500 font-mono">ATTENTION TRACKING</div>
                             <div className="text-sm font-bold">
                               {totalFraud === 0 ? (
                                 <span className="text-emerald-400 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> Focus Maintained</span>
                               ) : (
                                 <span className="text-rose-400 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">warning</span> {totalFraud} Violation{totalFraud > 1 ? 's' : ''} Detected</span>
                               )}
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-indigo-500/10 flex flex-wrap gap-4 justify-between">
                    <button onClick={() => setIsSaving(true)} className="px-6 py-2.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/40 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">save</span> Save for Comparison
                    </button>
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
                {state.isTranscribing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{state.isListening ? "mic_off" : "mic"}</span>
                )}
              </button>
              <div className="flex-1 relative">
                <input
                  value={state.inputValue}
                  onChange={(e) => actions.setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={state.isThinking}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-5 text-white font-mono text-sm focus:border-cyan-500/50 outline-none placeholder-slate-500 disabled:opacity-40 transition-all"
                  placeholder={state.isTranscribing ? "Gemini is transcribing..." : state.isListening ? "Listening to your voice..." : "Type response or initialize mic..."}
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
        videoMetrics={state.videoMetrics}
        isVideoEnabled={state.isVideoEnabled}
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
      />

      {/* Candidate Save Modal (Handled inline for density) */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
           <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-sm md:max-w-md shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-2">Save Record</h3>
              <p className="text-slate-500 text-sm mb-6">Enter candidate name to store the evaluation results.</p>
              <input 
                autoFocus
                type="text" 
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Candidate Name"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white mb-6 focus:border-indigo-500/50 outline-none"
              />
              <div className="flex gap-4">
                <button onClick={() => setIsSaving(false)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-all">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">Save Details</button>
              </div>
           </div>
        </div>
      )}

      {/* Comparisons UI could be a modal or panel */}
      {isHistoryOpen && (
        <CandidateHistoryPanel 
          candidates={telemetry.candidates}
          onClose={() => setIsHistoryOpen(false)}
          comparingIds={comparingIds}
          onToggleCompare={toggleCompare}
          onGenerateRoadmap={handleGenerateRoadmap}
          isGeneratingRoadmap={isGeneratingRoadmap}
        />
      )}

      {isWhiteboardOpen && (
        <Whiteboard 
          onClose={() => setIsWhiteboardOpen(false)} 
          aiCommands={state.aiWhiteboardCommands}
        />
      )}

      {/* Webcam PiP */}
      {state.isVideoEnabled && state.videoStream && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-black">
            <video
              ref={refs.videoRef}
              autoPlay
              playsInline
              muted
              className="w-48 h-36 object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Live</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                <span className="text-[10px] font-black text-emerald-400">{state.videoMetrics.overallPresence}%</span>
              </div>
            </div>
            <button
              onClick={actions.toggleVideo}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-rose-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <span className="material-symbols-outlined text-white text-xs">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateHistoryPanel({ candidates, onClose, comparingIds, onToggleCompare, onGenerateRoadmap, isGeneratingRoadmap }: any) {
  const selectedCandidates = candidates.filter((c: any) => comparingIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full lg:max-w-2xl bg-slate-900 h-full shadow-2xl border-l border-white/10 flex flex-col animate-slide-in-right">
        <div className="p-4 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Candidate Records</h2>
            <p className="text-slate-500 text-sm">Review and compare past evaluation data.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-8">
          {comparingIds.length > 0 && (
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-4 md:p-6">
              <h3 className="text-indigo-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4">Live Comparison Matrix</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1" />
                {selectedCandidates.map((c: any) => (
                   <div key={c.id} className="text-center font-bold text-white text-[10px] truncate px-1">
                     {c.name}
                   </div>
                ))}
              </div>
              {['clarity', 'engagement', 'patience', 'adaptability'].map((metric) => (
                <div key={metric} className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-3 border-t border-white/5 items-center">
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">{metric}</div>
                  {selectedCandidates.map((c: any) => (
                    <div key={c.id} className="text-center font-mono text-xs text-indigo-400 font-bold">
                       {c.metrics[metric]}%
                    </div>
                  ))}
                  {Array.from({ length: 3 - selectedCandidates.length }).map((_, i) => <div key={i} />)}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm">Recent Sessions (Max 5)</h3>
            {candidates.length === 0 ? (
              <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-slate-500 text-sm italic">
                No saved candidates found.
              </div>
            ) : (
              candidates.map((c: any) => (
                <div key={c.id} className={`p-5 rounded-2xl border transition-all ${comparingIds.includes(c.id) ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{c.name}</h4>
                      <p className="text-slate-500 text-[10px] font-mono tracking-widest capitalize">{c.date}</p>
                    </div>
                    <button 
                      onClick={() => onToggleCompare(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        comparingIds.includes(c.id) ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {comparingIds.includes(c.id) ? 'Remove' : 'Select to Compare'}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(c.metrics).map(([key, val]: any) => (
                      <div key={key} className="bg-black/20 p-2 rounded-lg text-center">
                        <div className="text-[8px] uppercase text-slate-600 font-black mb-0.5">{key[0]}</div>
                        <div className="text-[10px] font-bold text-white">{val}%</div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onGenerateRoadmap(c)}
                    disabled={isGeneratingRoadmap === c.id}
                    className="w-full mt-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isGeneratingRoadmap === c.id ? 'sync' : 'auto_graph'}
                    </span>
                    {isGeneratingRoadmap === c.id ? 'Analyzing Performance...' : 'Generate Learning Roadmap'}
                  </button>
                </div>
              ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

