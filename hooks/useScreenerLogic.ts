import { useState, useRef, useEffect } from "react";
// Unified Telemetry & Logic Store
import { useTelemetryStore } from "@/hooks/useTelemetryStore";

export interface Message {
  speaker: string;
  text: string;
  isAi: boolean;
  isReport?: boolean;
  reportMetrics?: any;
  isSpoken?: boolean;
}

export interface ScreenerMetrics {
  clarity: number;
  engagement: number;
  patience: number;
  adaptability: number;
}

export interface VideoMetrics {
  eyeContact: number;
  gestures: number;
  smileFrequency: number;
  posture: number;
  overallPresence: number;
}

export function useScreenerLogic(showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void) {
  const telemetry = useTelemetryStore();
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [dialogue, setDialogue] = useState<Message[]>([]);
  const [inputMode, setInputMode] = useState<"spoken" | "typed">("typed");
  const [fraudFlags, setFraudFlags] = useState<{type: string, time: number}[]>([]);
  const [metrics, setMetrics] = useState<ScreenerMetrics>({
    clarity: 0,
    engagement: 0,
    patience: 0,
    adaptability: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [aiWhiteboardCommands, setAiWhiteboardCommands] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const liveTranscriptRef = useRef(liveTranscript);
  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);

  // ─── Video Analysis State ──────────────────────────────
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [videoMetrics, setVideoMetrics] = useState<VideoMetrics>({
    eyeContact: 0, gestures: 0, smileFrequency: 0, posture: 0, overallPresence: 0
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoSnapshotCount = useRef(0);

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !isVideoEnabled) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 320; // Low-res is fine for analysis
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 320, 240);
      const frame = canvas.toDataURL("image/jpeg", 0.6);

      const res = await fetch("/api/video-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame }),
      });
      if (!res.ok) return;
      const scores = await res.json();
      videoSnapshotCount.current += 1;
      const n = videoSnapshotCount.current;

      // Running average across all snapshots
      setVideoMetrics(prev => ({
        eyeContact: Math.round((prev.eyeContact * (n - 1) + scores.eyeContact) / n),
        gestures: Math.round((prev.gestures * (n - 1) + scores.gestures) / n),
        smileFrequency: Math.round((prev.smileFrequency * (n - 1) + scores.smileFrequency) / n),
        posture: Math.round((prev.posture * (n - 1) + scores.posture) / n),
        overallPresence: Math.round((prev.overallPresence * (n - 1) + scores.overallPresence) / n),
      }));
    } catch (e) {
      console.warn("Video frame analysis failed:", e);
    }
  };

  const toggleVideo = async () => {
    if (isVideoEnabled && videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      setVideoStream(null);
      setIsVideoEnabled(false);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" } });
      setVideoStream(stream);
      setIsVideoEnabled(true);
      showToast("📷 Camera active — analyzing non-verbal cues", "info");
      // Start 30-second analysis interval
      videoIntervalRef.current = setInterval(captureAndAnalyzeFrame, 30000);
      // Also run one immediate analysis after 3s to warm up
      setTimeout(captureAndAnalyzeFrame, 3000);
    } catch (e) {
      showToast("Camera access denied or unavailable.", "error");
    }
  };

  const startRecording = async () => {
    if (isListening || isThinking) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("Recording not supported in this browser.", "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // 1. Setup Live Preview (Low latency, browser-level)
      if (typeof window !== "undefined") {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let current = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              current += event.results[i][0].transcript;
            }
            setLiveTranscript(current);
          };
          recognition.start();
          recognitionRef.current = recognition;
        }
      }
      
      // 2. Setup Master Recording (High precision, backend-level)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") 
        ? "audio/webm" 
        : MediaRecorder.isTypeSupported("audio/mp4") 
          ? "audio/mp4" 
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (finalBlob.size < 4000) {
          // Too small — likely silence or accidental click
          setLiveTranscript("");
          return;
        }
        await handleTranscription(finalBlob);
      };

      recorder.start(250); // Collect data every 250ms for reliability
      setIsListening(true);
    } catch (err) {
      console.error("Recording error:", err);
      showToast("Microphone access denied or error occurred.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      // Immediately stop the visualizer stream to save CPU
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      const extension = blob.type.includes("mp4") ? "mp4" : "webm";
      formData.append("audio", blob, `audio.${extension}`);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      const llmText = data.text ? data.text.trim() : "";
      
      // Filter hallucinated/garbage transcriptions from Gemini
      const isGarbage = 
        !llmText ||
        llmText.length < 2 ||
        /^\[.*\]$/.test(llmText) || // [silence], [audio], [music] etc.
        /^(okay|ok|um|uh|hmm|hello|hi|\.+|\?+|,+)$/i.test(llmText) ||
        /^no\s*(audio|speech|sound|input)/i.test(llmText) ||
        /^(the\s+)?(audio|video|recording)\s+(is|was|contains?)\s/i.test(llmText);
      
      const currentLive = liveTranscriptRef.current.trim();
      let finalText = "";
      
      if (isGarbage || data.error) {
         // Backend failed or hallucinated — fall back to browser preview
         finalText = currentLive;
      } else {
         finalText = llmText;
      }

      if (finalText && finalText.length >= 2) {
        setLiveTranscript("");
        setInputMode("spoken");
        setInputValue(prev => {
          if (!prev) return finalText;
          return prev.endsWith(" ") ? prev + finalText : prev + " " + finalText;
        });
      } else {
         // Nothing usable — just clear state
         setLiveTranscript("");
      }
    } catch (e) {
      showToast("Failed to reach transcription server.", "error");
    } finally {
      setIsTranscribing(false);
      setLiveTranscript("");
    }
  };

  // Monitor AI Speech for animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        setIsAiTalking(window.speechSynthesis.speaking);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll logic (now exposed so component can call it or bind ref)
  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialogue, isThinking]);

  // Auto-trigger evaluation when timer hits 0
  useEffect(() => {
    if (timer === 0 && interviewStarted && !interviewEnded && dialogue.length > 2) {
      showToast("⏱️ Time's up! Generating your evaluation report...", "info");
      endInterview();
    }
  }, [timer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fraud & Attention tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewStarted && !interviewEnded) {
        showToast("⚠️ Tab switch detected! Activity flagged.", "warning");
        setFraudFlags(prev => [...prev, { type: "tab_switch", time: 600 - timer }]);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && interviewStarted && !interviewEnded) {
        showToast("⚠️ Fullscreen exited! Activity flagged.", "warning");
        setFraudFlags(prev => [...prev, { type: "fullscreen_exit", time: 600 - timer }]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [interviewStarted, interviewEnded, timer]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, [audioStream]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Persist metrics & dialogue
  useEffect(() => {
    if (dialogue.length > 0 && interviewStarted) {
      localStorage.setItem("cuemath_screener_history", JSON.stringify(dialogue));
      localStorage.setItem("cuemath_screener_metrics", JSON.stringify(metrics));
      localStorage.setItem("cuemath_screener_timer", timer.toString());
    }
  }, [dialogue, metrics, timer, interviewStarted]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cuemath_screener_history");
    const savedMetrics = localStorage.getItem("cuemath_screener_metrics");
    const savedTimer = localStorage.getItem("cuemath_screener_timer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setDialogue(parsed);
          setInterviewStarted(true);
          const isEnded = parsed.some((m: Message) => m.isReport);
          if (isEnded) {
            setInterviewEnded(true);
            if (timerRef.current) clearInterval(timerRef.current);
          } else {
            // Resume from saved time or default
            if (savedTimer) setTimer(parseInt(savedTimer));
            
            // Resume timer interval if interview was in progress
            if (!timerRef.current) {
               timerRef.current = setInterval(() => {
                 setTimer((prev) => {
                   if (prev <= 1) {
                     if (timerRef.current) clearInterval(timerRef.current);
                     return 0;
                   }
                   return prev - 1;
                 });
               }, 1000);
            }
          }
        }
      } catch {}
    }
    if (savedMetrics) {
      try { setMetrics(JSON.parse(savedMetrics)); } catch {}
    }
  }, []);

  const playTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      let voice = voices.find((v) => v.lang.startsWith("en") && 
        (v.name.includes("Female") || v.name.includes("Zira") || 
         v.name.includes("Samantha") || v.name.includes("Google US English") || 
         v.name.includes("Victoria") || v.name.includes("Karen")));
         
      if (!voice) voice = voices.find((v) => v.lang.startsWith("en"));

      if (voice) utterance.voice = voice;
      utterance.rate = 1.15;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startInterview = async () => {
    try {
      if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed:", e);
    }

    setInterviewStarted(true);
    setIsThinking(true);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        if (prev === 120) {
          showToast("⏰ 2 minutes remaining! Wrap up soon.", "warning");
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], generateReport: false }),
      });
      const data = await response.json();
      
      let cleanText = data.text;
      const whiteboardMatch = data.text.match(/\[WHITEBOARD:\s*(\{.*?\})\]/);
      if (whiteboardMatch) {
        try {
          const cmd = JSON.parse(whiteboardMatch[1]);
          setAiWhiteboardCommands(prev => [...prev, cmd]);
          cleanText = data.text.replace(/\[WHITEBOARD:\s*(\{.*?\})\]/, "").trim();
        } catch (e) {}
      }

      setDialogue([{ speaker: "Interviewer AI", text: cleanText, isAi: true }]);
      playTTS(cleanText);
    } catch (e: any) {
      showToast("Failed to start interview. Check your connection.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const endInterview = async () => {
    try {
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {}

    if (timerRef.current) clearInterval(timerRef.current);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
      setAudioStream(null);
    }
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
      setIsVideoEnabled(false);
    }
    setInterviewEnded(true);
    setIsListening(false);
    setIsThinking(true);
    window.speechSynthesis.cancel();

    const currentDialogue = [...dialogue];
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentDialogue, generateReport: true }),
      });
      const data = await response.json();
      let reportText = data.text;
      let parsedMetrics = null;
      
      const metricsMatch = reportText.match(/\[METRICS:\s*(\{.*?\})\]/);
      if (metricsMatch) {
        try {
          parsedMetrics = JSON.parse(metricsMatch[1]);
          reportText = reportText.replace(/\[METRICS:\s*(\{.*?\})\]/, "").trim();
        } catch (e) {
            console.error("Failed to parse metrics", e);
        }
      }

      setDialogue((prev) => [
        ...prev,
        { speaker: "Evaluation Report", text: reportText, isAi: true, isReport: true, reportMetrics: parsedMetrics },
      ]);
      const performanceScore = Math.max(50, Math.round((metrics.clarity + metrics.engagement + metrics.patience) / 3)) || 75;
      const durationSeconds = 600 - timer;
      telemetry.addSessionResult("AI Tutor Assessment", durationSeconds, performanceScore);
    } catch (e: any) {
      showToast("Failed to generate report. Please try again.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const toggleListen = async () => {
    if (isListening) {
      stopRecording();
    } else {
      window.speechSynthesis.cancel();
      await startRecording();
    }
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || inputValue;
    if (!text.trim() || !interviewStarted || interviewEnded) return;

    if (isListening) {
      stopRecording();
    }

    const newMsg: Message = { speaker: "Candidate", text, isAi: false, isSpoken: inputMode === "spoken" };
    const newDialogue = [...dialogue, newMsg];
    setDialogue(newDialogue);
    setInputValue("");
    setInputMode("typed"); // Reset to typed for next input unless speech sets it to spoken
    setIsThinking(true);

    setMetrics((prev) => ({
      clarity: Math.min(100, prev.clarity + Math.floor(Math.random() * 8 + 3)),
      engagement: Math.min(100, prev.engagement + Math.floor(Math.random() * 7 + 2)),
      patience: Math.min(100, prev.patience + Math.floor(Math.random() * 6 + 3)),
      adaptability: Math.min(100, prev.adaptability + Math.floor(Math.random() * 7 + 2)),
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newDialogue }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      let cleanText = data.text;
      const whiteboardMatch = data.text.match(/\[WHITEBOARD:\s*(\{.*?\})\]/);
      if (whiteboardMatch) {
        try {
          const cmd = JSON.parse(whiteboardMatch[1]);
          setAiWhiteboardCommands(prev => [...prev, cmd]);
          cleanText = data.text.replace(/\[WHITEBOARD:\s*(\{.*?\})\]/, "").trim();
        } catch (e) {
          console.error("Whiteboard command parse error", e);
        }
      }

      setDialogue((prev) => [
        ...prev,
        { speaker: "Interviewer AI", text: cleanText, isAi: true },
      ]);
      playTTS(cleanText);
    } catch (e: any) {
      showToast("AI response failed. " + (e.message || "Please retry."), "error");
    } finally {
      setIsThinking(false);
    }
  };

  const resetSession = () => {
    try {
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (e) {}

    localStorage.removeItem("cuemath_screener_history");
    localStorage.removeItem("cuemath_screener_metrics");
    setDialogue([]);
    setInterviewStarted(false);
    setInterviewEnded(false);
    setTimer(600);
    setMetrics({ clarity: 0, engagement: 0, patience: 0, adaptability: 0 });
    setVideoMetrics({ eyeContact: 0, gestures: 0, smileFrequency: 0, posture: 0, overallPresence: 0 });
    videoSnapshotCount.current = 0;
    showToast("Neurolink reset. Ready for a new candidate.", "success");
  };

  return {
    state: {
      isListening, isThinking, isAiTalking, interviewStarted, interviewEnded, 
      timer, inputValue, dialogue, metrics, audioStream, isTranscribing, 
      liveTranscript, aiWhiteboardCommands, videoStream, isVideoEnabled, videoMetrics, fraudFlags
    },
    refs: {
      reportRef, dialogueEndRef, videoRef
    },
    actions: {
      setInputValue, startInterview, endInterview, toggleListen, handleSend, resetSession, toggleVideo
    }
  };
}
