"use client";

import { useEffect, useState } from "react";
import { useVoice } from "@/hooks/useVoice";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { state, isSupported, toggleListening } = useVoice({
    onTranscript,
    language: "en-IN",
  });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isSupported) return null;

  const isListening = state === "listening";

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Start voice input"}
      style={{
        width: "40px", height: "40px",
        borderRadius: "50%",
        border: isListening
          ? "1px solid rgba(255,107,53,0.6)"
          : "1px solid var(--border-subtle)",
        background: isListening ? "rgba(255,107,53,0.12)" : "transparent",
        color: isListening ? "#ff6b35" : "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease",
        flexShrink: 0,
        animation: isListening ? "glow-pulse 1.5s ease-in-out infinite" : "none",
        boxShadow: isListening ? "0 0 16px rgba(255,107,53,0.3)" : "none",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {isListening ? (
        /* Waveform bars while listening */
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              style={{
                width: "3px",
                background: "#ff6b35",
                borderRadius: "2px",
                animation: `wave-${bar} 0.6s ease-in-out infinite`,
                animationDelay: `${bar * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      )}

      <style>{`
        @keyframes wave-1 { 0%,100%{height:6px} 50%{height:14px} }
        @keyframes wave-2 { 0%,100%{height:10px} 50%{height:6px} }
        @keyframes wave-3 { 0%,100%{height:6px} 50%{height:12px} }
      `}</style>
    </button>
  );
}
