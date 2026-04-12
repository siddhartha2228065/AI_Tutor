"use client";

import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/Toast";

interface Slide {
  id: number;
  type: string;
  title: string;
  content: string;
}

export default function StudioPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'canvas' | 'story' | 'templates' | 'assets' | 'image'>('canvas');
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState("A hyper-realistic 3D render of a futuristic classroom floating in space, unreal engine 5, cinematic lighting");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageHasLoaded, setImageHasLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const [topic, setTopic] = useState("The Forgetting Curve");
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, type: "HOOK", title: "Why do kids forget?", content: "The science of the 'Forgetting Curve' and how to stop it today." },
    { id: 2, type: "THE PROBLEM", title: "The Forgetting Curve explained...", content: "Memory decays exponentially within days of learning new concepts." },
    { id: 3, type: "SOLUTION", title: "Enter Spaced Repetition", content: "Algorithmic review schedules precisely when a student is about to forget." },
    { id: 4, type: "CALL TO ACTION", title: "Start with Cuemath", content: "Lock in knowledge forever with our personalized AI algorithms." }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);

  const generateSlides = async (overrideTopic?: string) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic.trim()) return;
    
    // Clear out old data visually to show loading
    setSlides([]);
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: finalTopic, mode: activeTab === 'story' ? 'story' : 'canvas' }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      if (data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setActiveSlide(data.slides[0].id);
      }
    } catch (error: any) {
      showToast("Failed to generate slides. " + (error.message || ""), "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    { name: "Algebra Foundations", desc: "Introductory module for linear equations." },
    { name: "Calculus Speedrun", desc: "Fast-paced derivative rules and limits." },
    { name: "Geometry Basics", desc: "Shapes, angles, and spatial reasoning." },
    { name: "Physics 101", desc: "Kinematics and forces explained simply." }
  ];

  const assets = [
    { name: "Math Backgrounds", items: 8 },
    { name: "3D Shapes Pack", items: 12 },
    { name: "UI Icons", items: 45 },
    { name: "Charts & Graphs", items: 6 }
  ];

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] overflow-hidden bg-slate-900 text-slate-200">
      
      {/* Studio Left Sidebar (Tools) */}
      <div className="w-20 md:w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col items-center md:items-start flex-shrink-0 z-20">
        <div className="p-4 md:p-6 w-full hidden md:block">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Studio Intelligence</h2>
          <p className="text-[10px] text-slate-400">Powered by Cuemath AI</p>
        </div>
        
        <div className="w-full flex-1 flex flex-col gap-2 p-2 md:p-4">
          <button 
            onClick={() => setActiveTab('canvas')}
            className={`w-full flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-colors group ${activeTab === 'canvas' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={activeTab === 'canvas' ? { fontVariationSettings: "'FILL' 1" } : {}}>auto_awesome</span>
            <span className="hidden md:block text-sm font-bold">AI Canvas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('story')}
            className={`w-full flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'story' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={activeTab === 'story' ? { fontVariationSettings: "'FILL' 1" } : {}}>auto_stories</span>
            <span className="hidden md:block text-sm font-bold">Storytelling</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={activeTab === 'templates' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard_customize</span>
            <span className="hidden md:block text-sm font-bold">Templates</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('assets')}
            className={`w-full flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={activeTab === 'assets' ? { fontVariationSettings: "'FILL' 1" } : {}}>folder_open</span>
            <span className="hidden md:block text-sm font-bold">Assets</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('image')}
            className={`w-full flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === 'image' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={activeTab === 'image' ? { fontVariationSettings: "'FILL' 1" } : {}}>photo_camera</span>
            <span className="hidden md:block text-sm font-bold">Image Creator</span>
          </button>
        </div>
      </div>

      {/* Center Canvas Area */}
      <div className="flex-1 bg-slate-950 relative flex justify-center items-center overflow-hidden">
        {/* Generative Aurora Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen opacity-50"></div>

        <div className="w-full h-full overflow-y-auto p-8 custom-scrollbar relative z-10 flex flex-col items-center">
          
          {(activeTab === 'canvas' || activeTab === 'story') && (
            <div className="w-full max-w-4xl flex flex-col gap-6 items-center">
              {isGenerating ? (
                <div className="w-full flex flex-col gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full bg-slate-900/80 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden animate-pulse">
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500/30 to-teal-400/30" />
                      <div className="w-32 flex-shrink-0 space-y-3">
                        <div className="h-3 w-16 bg-white/10 rounded-full" />
                        <div className="h-12 w-12 bg-white/5 rounded-lg" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="h-6 w-3/4 bg-white/10 rounded-full" />
                        <div className="h-4 w-full bg-white/5 rounded-full" />
                        <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                      </div>
                      {/* Animated shimmer overlay */}
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                  ))}
                </div>
              ) : (
                slides.map((slide, idx) => (
                  <div 
                    key={slide.id} 
                    onClick={() => setActiveSlide(slide.id)}
                    className={`w-full bg-slate-900/80 backdrop-blur-xl border ${activeSlide === slide.id ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'} rounded-3xl p-8 transition-all duration-300 cursor-pointer shadow-2xl flex flex-col md:flex-row gap-6 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-teal-400 opacity-50"></div>
                    
                    <div className="w-32 flex-shrink-0">
                      <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400 block mb-2">{slide.type}</span>
                      <h1 className="text-5xl font-black text-white/20 font-headline">0{idx + 1}</h1>
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-headline font-bold text-white mb-3 tracking-tight">
                        {slide.title}
                      </h2>
                      <p className="text-slate-400 leading-relaxed text-lg">
                        {slide.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="w-full max-w-5xl">
              <h2 className="text-3xl font-headline font-bold mb-8 text-white">Course Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((tpl, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setTopic(tpl.name);
                      setActiveTab('canvas');
                      generateSlides(tpl.name);
                    }}
                    className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500 rounded-3xl p-8 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span className="material-symbols-outlined text-indigo-400 text-4xl mb-4 block group-hover:scale-110 transition-transform">school</span>
                    <h3 className="text-xl font-bold text-white mb-2">{tpl.name}</h3>
                    <p className="text-slate-400">{tpl.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Use Template <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="w-full max-w-5xl">
              <h2 className="text-3xl font-headline font-bold mb-8 text-white">Media Library</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {assets.map((asset, i) => (
                  <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group cursor-pointer">
                    <div className="h-32 bg-slate-800 relative flex items-center justify-center group-hover:bg-indigo-900/50 transition-colors">
                      <span className="material-symbols-outlined text-slate-600 group-hover:text-indigo-400 text-4xl">inventory_2</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white text-sm mb-1">{asset.name}</h4>
                      <span className="text-xs text-slate-500">{asset.items} Items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="w-full h-full flex flex-col items-center justify-center pt-8 pb-8">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center text-teal-400 animate-pulse">
                   <span className="material-symbols-outlined text-6xl mb-4 animate-spin">rotate_right</span>
                   <h2 className="text-xl font-bold font-headline">Synthesizing Pixels...</h2>
                   <p className="text-sm mt-2 text-slate-500 text-center max-w-sm">This takes about 10-15 seconds. The AI is computing complex visuals on Edge servers...</p>
                </div>
              ) : generatedImageUrl ? (
                <div className="w-full max-w-4xl max-h-full rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl relative flex items-center justify-center min-h-[400px]">
                  
                  {/* Keep the loading spinner visible UNTIL the image specifically triggers onLoad */}
                  {!imageHasLoaded && !imageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 animate-pulse bg-slate-900/80 z-20">
                      <span className="material-symbols-outlined text-5xl mb-3 animate-bounce">downloading</span>
                      <p className="font-bold">Downloading high-res asset...</p>
                    </div>
                  )}

                  {imageError && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-400 bg-slate-900/80 z-20">
                      <span className="material-symbols-outlined text-5xl mb-3">broken_image</span>
                      <p className="font-bold">Generation Failed or Blocked by Browser</p>
                    </div>
                  )}

                  <img 
                    src={generatedImageUrl} 
                    alt="Generated Asset" 
                    className={`w-full object-contain max-h-[70vh] rounded-2xl transition-opacity duration-500 ${imageHasLoaded ? 'opacity-100' : 'opacity-0'}`} 
                    onLoad={() => setImageHasLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageHasLoaded(false);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-30">
                     <button
                       onClick={async () => {
                         try {
                           const res = await fetch(generatedImageUrl!);
                           const blob = await res.blob();
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = `cuemath-asset-${Date.now()}.svg`;
                           a.click();
                           URL.revokeObjectURL(url);
                           showToast("Image downloaded successfully!", "success");
                         } catch {
                           showToast("Download failed.", "error");
                         }
                       }}
                       className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                     >
                       <span className="material-symbols-outlined">download</span> Download SVG
                     </button>
                     <a href={generatedImageUrl} target="_blank" rel="noopener noreferrer" className="bg-white/20 text-white font-bold py-3 px-8 rounded-full hover:bg-white/30 backdrop-blur-md transition-colors flex items-center gap-2">
                       <span className="material-symbols-outlined">open_in_new</span> Open in Tab
                     </a>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl aspect-video border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-6xl mb-4 opacity-50">imagesmode</span>
                  <p className="font-headline text-xl">Describe an image to generate</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Right Generation Panel (Only visible in generative modes) */}
      {(activeTab === 'canvas' || activeTab === 'story') && (
        <div className="w-72 md:w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl hidden lg:flex flex-col z-20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white">Generate {activeTab === 'story' ? 'Story' : 'Narrative'}</h3>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider">AI Studio</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                {activeTab === 'story' ? 'Protagonist / Plot' : 'Topic / Syllabus'}
              </label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-32 transition-all"
                placeholder={activeTab === 'story' ? "E.g. A space explorer learning gravity..." : "E.g. Explain Quantum Mechanics..."}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Brand Kit Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-indigo-600/20 border border-indigo-500 text-indigo-300 py-2 rounded-lg text-sm font-bold">Cuemath UI</button>
                <button className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-sm font-bold transition-all">Handwritten</button>
                <button className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-sm font-bold transition-all">Minimal</button>
                <button className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-sm font-bold transition-all">Corporate</button>
              </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => generateSlides(topic)}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-teal-500 hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">rotate_right</span> Building {activeTab === 'story' ? 'Chapters' : 'Outline'}...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Generate {activeTab === 'story' ? 'Story' : 'Slides'}</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Right Generation Panel for Images */}
      {activeTab === 'image' && (
        <div className="w-72 md:w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl hidden lg:flex flex-col z-20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white">Generate Image</h3>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider">AI Studio</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Image Subject
              </label>
              <textarea 
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-32 transition-all"
                placeholder="E.g. A hyper-realistic 3D render of a futuristic classroom..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Fast Styles</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setImagePrompt(p => p + ", highly detailed 3D render, unreal engine 5, octane render")} className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-[11px] font-bold transition-all">3D Render</button>
                <button onClick={() => setImagePrompt(p => p + ", flat vector illustration, corporate memphis, bright colors")} className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-[11px] font-bold transition-all">Vector Art</button>
                <button onClick={() => setImagePrompt(p => p + ", cinematic lighting, hyper-realistic photography, 8k resolution")} className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-[11px] font-bold transition-all">Photorealistic</button>
                <button onClick={() => setImagePrompt(p => p + ", blueprint drawing, technical diagram, clean lines")} className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 py-2 rounded-lg text-[11px] font-bold transition-all">Diagram</button>
              </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => {
                  if (!imagePrompt.trim()) return;
                  setIsGeneratingImage(true);
                  setImageHasLoaded(false);
                  setImageError(false);
                  // Artificial slight delay for UI feedback before changing src
                  setTimeout(() => {
                    const encoded = encodeURIComponent(imagePrompt);
                    setGeneratedImageUrl(`/api/image?prompt=${encoded}&cachebuster=${Math.random()}`);
                    setIsGeneratingImage(false);
                  }, 1500);
                }}
                disabled={isGeneratingImage}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">rotate_right</span> Creating...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">draw</span> Generate Image</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
