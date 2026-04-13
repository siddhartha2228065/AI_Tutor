"use client";

import { useEffect, useMemo } from "react";
import { soundEngine } from "@/lib/soundEngine";
import { useTheme } from "@/components/ThemeContext";

export function useSound() {
  const { theme } = useTheme();

  useEffect(() => {
    // We could entirely mute sounds on "brand" theme if we want it completely corporate,
    // but a light audible feedback is still nice. Let's just keep them on for now, 
    // or adjust the engine properties in future iterations.
    soundEngine.setMuted(false); 
  }, [theme]);

  // Wrap the engine methods to ensure they are safely callable without throwing bounds issues.
  const sounds = useMemo(() => ({
    playHover: () => soundEngine.playHover(),
    playClick: () => soundEngine.playClick(),
    playTyping: () => soundEngine.playTyping(),
    playSuccess: () => soundEngine.playSuccess(),
    playThemeSwitch: () => soundEngine.playThemeSwitch(),
  }), []);

  return sounds;
}
