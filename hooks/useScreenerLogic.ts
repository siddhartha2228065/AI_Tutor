import { useState, useRef, useEffect } from "react";
import { useTelemetryStore } from "@/hooks/useTelemetryStore";

export interface Message {
  speaker: string;
  text: string;
  isAi: boolean;
  isReport?: boolean;
}

export interface ScreenerMetrics {
  clarity: number;
  engagement: number;
  patience: number;
  adaptability: number;
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
  const [metrics, setMetrics] = useState<ScreenerMetrics>({
    clarity: 0,
    engagement: 0,
    patience: 0,
    adaptability: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          let isFinal = false;
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) isFinal = true;
          }
          setInputValue(currentTranscript);
          if (isFinal) {
            recognition.stop();
            setIsListening(false);
            handleSend(currentTranscript);
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, [audioStream]);

  // Persist metrics & dialogue
  useEffect(() => {
    if (dialogue.length > 0 && interviewStarted) {
      localStorage.setItem("cuemath_screener_history", JSON.stringify(dialogue));
      localStorage.setItem("cuemath_screener_metrics", JSON.stringify(metrics));
    }
  }, [dialogue, metrics, interviewStarted]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cuemath_screener_history");
    const savedMetrics = localStorage.getItem("cuemath_screener_metrics");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setDialogue(parsed);
          setInterviewStarted(true);
          if (parsed.some((m: Message) => m.isReport)) {
            setInterviewEnded(true);
            if (timerRef.current) clearInterval(timerRef.current);
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
      setDialogue([{ speaker: "Interviewer AI", text: data.text, isAi: true }]);
      playTTS(data.text);
    } catch (e: any) {
      showToast("Failed to start interview. Check your connection.", "error");
    } finally {
      setIsThinking(false);
    }
  };

  const endInterview = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioStream) {
      audioStream.getTracks().forEach((t) => t.stop());
      setAudioStream(null);
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
      setDialogue((prev) => [
        ...prev,
        { speaker: "Evaluation Report", text: data.text, isAi: true, isReport: true },
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
    if (!recognitionRef.current) {
      showToast("Voice recognition not supported in this browser. Please type instead.", "warning");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      try {
        if (!audioStream) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setAudioStream(stream);
        }
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        showToast("Microphone access denied.", "error");
      }
    }
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || inputValue;
    if (!text.trim() || !interviewStarted || interviewEnded) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const newMsg: Message = { speaker: "Candidate", text, isAi: false };
    const newDialogue = [...dialogue, newMsg];
    setDialogue(newDialogue);
    setInputValue("");
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

      setDialogue((prev) => [
        ...prev,
        { speaker: "Interviewer AI", text: data.text, isAi: true },
      ]);
      playTTS(data.text);
    } catch (e: any) {
      showToast("AI response failed. " + (e.message || "Please retry."), "error");
    } finally {
      setIsThinking(false);
    }
  };

  const resetSession = () => {
    localStorage.removeItem("cuemath_screener_history");
    localStorage.removeItem("cuemath_screener_metrics");
    setDialogue([]);
    setInterviewStarted(false);
    setInterviewEnded(false);
    setTimer(600);
    setMetrics({ clarity: 0, engagement: 0, patience: 0, adaptability: 0 });
    showToast("Neurolink reset. Ready for a new candidate.", "success");
  };

  return {
    state: {
      isListening, isThinking, isAiTalking, interviewStarted, interviewEnded, 
      timer, inputValue, dialogue, metrics, audioStream
    },
    refs: {
      reportRef, dialogueEndRef
    },
    actions: {
      setInputValue, startInterview, endInterview, toggleListen, handleSend, resetSession
    }
  };
}
