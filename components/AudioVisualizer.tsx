"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  color?: string;
}

export default function AudioVisualizer({ stream, isActive, color = "#6366f1" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (browser security requirement)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const audioCtx = audioCtxRef.current;
    
    // Additional safeguard for mobile browsers
    const resumeContext = () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
    };
    window.addEventListener('click', resumeContext, { once: true });
    window.addEventListener('touchstart', resumeContext, { once: true });

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient color based on bar height
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "#00e0c6"); // Secondary color

        ctx.fillStyle = gradient;
        
        // Draw centered bars
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('click', resumeContext);
      window.removeEventListener('touchstart', resumeContext);
      // We don't close the audio context here to avoid needing to recreate it
    };
  }, [stream, isActive, color]);

  return (
    <div className="flex items-center justify-center p-2 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full max-w-[200px] h-10 opacity-80"
      />
    </div>
  );
}
