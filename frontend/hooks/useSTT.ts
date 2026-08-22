"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAvatarStore } from "@/store/avatarStore";

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

// onEnd ke baad LLM call karne ke liye callback
type OnFinalCallback = (text: string) => void;

export function useSTT(onFinalText?: OnFinalCallback) {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const finalTextRef = useRef<string>(""); // ✅ Text yahan store hoga
  const setUserText = useAvatarStore((s) => s.setUserText);
  const setIsListening = useAvatarStore((s) => s.setIsListening);
  const setAvatarState = useAvatarStore((s) => s.setAvatarState);

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.error("Browser Speech Recognition support nahi karta.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      const currentText = finalText || interimText;
      
      // ✅ Ref mein save karo — state update ka wait nahi karna
      if (finalText) {
        finalTextRef.current = finalText;
      }
      
      // UI ke liye store update karo
      setUserText(currentText);
    };

    recognition.onstart = () => {
      finalTextRef.current = ""; // Reset karo
      setIsListening(true);
      setAvatarState("listening");
    };

    recognition.onend = () => {
      setIsListening(false);
      setAvatarState("idle");

      // ✅ Yahan se LLM call karo — ref se text lo
      const spokenText = finalTextRef.current.trim();
      console.log("Mic band hua. Bola gaya:", spokenText);

      if (spokenText && onFinalText) {
        onFinalText(spokenText);
      }

      finalTextRef.current = ""; // Reset
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("STT Error:", event.error);
      setIsListening(false);
      setAvatarState("idle");
      finalTextRef.current = "";
    };

    recognitionRef.current = recognition;
  }, [onFinalText, setUserText, setIsListening, setAvatarState]);

  const startListening = useCallback(() => {
    finalTextRef.current = "";
    recognitionRef.current?.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { startListening, stopListening };
}