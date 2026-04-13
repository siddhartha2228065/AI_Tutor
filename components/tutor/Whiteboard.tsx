"use client";

import React, { useRef, useEffect, useState } from "react";
import { Eraser, Pencil, Square, Circle, Trash2, X, Download } from "lucide-react";

interface WhiteboardProps {
  onClose: () => void;
  aiCommands?: any[]; // For future sync with AI responses
}

export default function Whiteboard({ onClose, aiCommands = [] }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "square" | "circle" | "eraser">("pencil");
  const [color, setColor] = useState("#06b6d4"); // Cyan
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const context = canvas.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      contextRef.current = context;
    }

    // Handle Resize
    const handleResize = () => {
      if (!canvas || !parent) return;
      const tempData = context?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (tempData) context?.putImageData(tempData, 0, 0);
      
      // Re-apply context settings after resize
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update context when color or tool changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === "eraser" ? "#0f172a" : color;
      contextRef.current.lineWidth = tool === "eraser" ? 20 : lineWidth;
    }
  }, [color, tool, lineWidth]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (tool === "pencil" || tool === "eraser") {
      contextRef.current?.lineTo(offsetX, offsetY);
      contextRef.current?.stroke();
    }
    // For shapes, we'd normally use a temp canvas or XOR mode, 
    // but for simplicity in this MVP, we'll focus on smooth pencil/eraser.
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(true); // Reset state
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ("nativeEvent" in e && e.nativeEvent instanceof MouseEvent) {
      return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    } else {
      const touch = (e as React.TouchEvent).touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        offsetX: touch.clientX - (rect?.left || 0),
        offsetY: touch.clientY - (rect?.top || 0)
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "cuemath-whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // AI Automatic Drawing Simulation
  useEffect(() => {
    if (aiCommands.length > 0) {
      const lastCommand = aiCommands[aiCommands.length - 1];
      if (lastCommand.action === "drawShape") {
        simulateAiDrawing(lastCommand.type, lastCommand.label);
      }
    }
  }, [aiCommands]);

  const simulateAiDrawing = (shape: string, label?: string) => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.strokeStyle = "#8b5cf6"; // AI use Violet for its drawings
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 50);
      ctx.lineTo(centerX - 50, centerY + 50);
      ctx.lineTo(centerX + 50, centerY + 50);
      ctx.closePath();
      ctx.stroke();
    } else if (shape === "square") {
      ctx.strokeRect(centerX - 50, centerY - 50, 100, 100);
    }

    if (label) {
      ctx.fillStyle = "#a78bfa";
      ctx.font = "bold 14px Inter";
      ctx.fillText(label, centerX - 20, centerY + 80);
    }

    ctx.restore();
  };

  return (
    <div className="fixed inset-4 md:inset-10 z-[100] flex flex-col glass-card border-none overflow-hidden animate-slide-in shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-400 text-sm">edit_square</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Interactive Whiteboard</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Shared Pedagogical Canvas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadImage}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Download Sketch"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-r border-white/5 bg-black/20 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto items-center">
          <ToolButton active={tool === "pencil"} onClick={() => setTool("pencil")} icon={<Pencil className="w-4 h-4" />} />
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon={<Eraser className="w-4 h-4" />} />
          <div className="w-px h-8 md:w-8 md:h-px bg-white/5 mx-1" />
          
          {/* Colors */}
          {["#06b6d4", "#6366f1", "#d946ef", "#10b981", "#ffffff"].map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pencil"); }}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: c }}
            />
          ))}

          <div className="flex-1" />
          <button 
            onClick={clearCanvas}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Clear All"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0f172a] cursor-crosshair">
           <canvas
             ref={canvasRef}
             onMouseDown={startDrawing}
             onMouseMove={draw}
             onMouseUp={stopDrawing}
             onMouseLeave={stopDrawing}
             onTouchStart={startDrawing}
             onTouchMove={draw}
             onTouchEnd={stopDrawing}
             className="touch-none"
           />
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 grow' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
    >
      {icon}
    </button>
  );
}
