"use client";

import { useEffect, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { Mic } from "lucide-react";

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
      className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isListening ? 'bg-red-50 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse' : 'bg-parchment text-ink/60 hover:bg-black/5 hover:text-ink'}`}
    >
      {isListening ? (
        <div className="flex gap-1 items-center">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className="w-1 bg-red-500 rounded-full"
              style={{
                animation: `wave-${bar} 0.6s ease-in-out infinite`,
                animationDelay: `${bar * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <Mic size={18} />
      )}

      <style>{`
        @keyframes wave-1 { 0%,100%{height:6px} 50%{height:14px} }
        @keyframes wave-2 { 0%,100%{height:10px} 50%{height:6px} }
        @keyframes wave-3 { 0%,100%{height:6px} 50%{height:12px} }
      `}</style>
    </button>
  );
}
