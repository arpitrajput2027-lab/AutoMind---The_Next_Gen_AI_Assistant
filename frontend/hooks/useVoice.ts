"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceState = "idle" | "listening" | "processing" | "error";

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  language?: string;
}

export function useVoice({ onTranscript, language = "en-IN" }: UseVoiceOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setState("error");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setState("listening");

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;

      if (result.isFinal) {
        setTranscript(text);
        onTranscript?.(text);
        setState("idle");
      } else {
        setTranscript(text);
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    setState("listening");
    recognition.start();
  }, [isSupported, language, onTranscript, state]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const toggleListening = useCallback(() => {
    if (state === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [state, startListening, stopListening]);

  return {
    state,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
