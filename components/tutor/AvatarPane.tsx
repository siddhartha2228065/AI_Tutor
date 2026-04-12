import AntiGravitySphere from "@/components/AntiGravitySphere";
import AudioVisualizer from "@/components/AudioVisualizer";

interface Props {
  isAiTalking: boolean;
  isThinking: boolean;
  isListening: boolean;
  audioStream: MediaStream | null;
}

export default function AvatarPane({ isAiTalking, isThinking, isListening, audioStream }: Props) {
  return (
    <div className="w-full xl:w-[35%] flex-shrink-0 relative border-b xl:border-b-0 xl:border-r border-white/10 bg-[#050510] flex flex-col justify-center items-center h-[35vh] xl:h-full overflow-hidden group">
      
      {/* Background Aura Pulse — reacts to state */}
      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[80px] transition-all duration-700 opacity-25 z-0 ${
        isAiTalking ? 'bg-amber-500 scale-110' : 
        isThinking ? 'bg-cyan-500 scale-95' : 
        isListening ? 'bg-indigo-500 scale-105' : 'bg-indigo-600 scale-100'
      }`} />

      {/* Circular mask frame with the 3D sphere rendered FULL-SIZE behind it */}
      <div className="relative z-10 w-64 h-64 rounded-full border-4 border-white/20 shadow-[0_0_60px_rgba(99,102,241,0.3)] bg-black"
           style={{ WebkitMaskImage: 'none' /* ensure no mask clip on the outer div */ }}
      >
        {/* 
          The trick: render the sphere into a div that has REAL pixel dimensions
          (bigger than the circle), position it centered, let the circle's 
          overflow-hidden (via rounded-full + clip) do the visual cropping.
          But the canvas itself gets full real dimensions for WebGL to work.
        */}
        <div 
          className="absolute rounded-full overflow-hidden"
          style={{
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        >
          {/* Inner wrapper gives the canvas real dimensions to initialize against */}
          <div style={{ width: '256px', height: '256px', position: 'relative' }}>
            <AntiGravitySphere isTalking={isAiTalking} isThinking={isThinking} isListening={isListening} />
          </div>
        </div>
      </div>

      {/* State Label below the circle */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <span className="font-semibold tracking-widest text-[10px] text-cyan-400 uppercase opacity-80 backdrop-blur-md bg-slate-900/30 px-3 py-1 rounded-full border border-cyan-500/20 shadow-lg">
          {isThinking ? "Processing Command..." : isAiTalking ? "AI Transmitting..." : isListening ? "Audio Feed Active" : "AI Screener Standby"}
        </span>
      </div>

      {/* Live Audio Visualizer Overlay */}
      {isListening && (
        <div className="absolute bottom-6 w-full flex justify-center z-10 animate-fade-in pointer-events-none">
          <div className="bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <AudioVisualizer stream={audioStream} isActive={isListening} />
          </div>
        </div>
      )}

      {/* Agent Status UI */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full animate-pulse ${isThinking ? 'bg-cyan-400' : isAiTalking ? 'bg-amber-400' : isListening ? 'bg-indigo-400' : 'bg-slate-500'}`} />
        <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
          {isThinking ? "Analyzing" : isAiTalking ? "Speaking" : isListening ? "Listening" : "Standby"}
        </span>
      </div>
    </div>
  );
}
