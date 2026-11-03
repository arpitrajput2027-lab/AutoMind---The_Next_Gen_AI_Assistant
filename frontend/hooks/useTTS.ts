"use client";

import { useCallback, useRef } from "react";
import { useAvatarStore } from "@/store/avatarStore";

function speakWithBrowser(text: string, onStart: () => void, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("Browser speech not available");
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  // Prefer an English/Indian voice if present
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en-IN/i.test(v.lang)) ||
    voices.find((v) => /en-US|en-GB/i.test(v.lang)) ||
    voices[0];
  if (preferred) utter.voice = preferred;
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export function useTTS() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setAvatarState = useAvatarStore((s) => s.setAvatarState);
  const setMouthAmplitude = useAvatarStore((s) => s.setMouthAmplitude);

  const startLipSync = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalized = Math.min(avg / 80, 1);
      setMouthAmplitude(normalized);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
  }, [setMouthAmplitude]);

  const stopLipSync = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setMouthAmplitude(0);
  }, [setMouthAmplitude]);

  const speakBrowserFallback = useCallback((text: string) => {
    setAvatarState("speaking");
    // Fake gentle mouth motion for browser TTS (no analyser)
    let t = 0;
    const tick = () => {
      t += 1;
      setMouthAmplitude(0.25 + Math.abs(Math.sin(t / 4)) * 0.45);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
    speakWithBrowser(
      text,
      () => setAvatarState("speaking"),
      () => {
        stopLipSync();
        setAvatarState("idle");
      }
    );
  }, [setAvatarState, setMouthAmplitude, stopLipSync]);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      setAvatarState("speaking");

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS API fail hui");

      const { audio } = await res.json();
      if (!audio) throw new Error("Audio nahi mila");

      const binaryStr = atob(audio);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      startLipSync(analyser);
      source.start(0);

      source.onended = () => {
        stopLipSync();
        setAvatarState("idle");
        audioContext.close();
      };
    } catch (error) {
      console.warn("Edge TTS failed, using browser voice:", error);
      try {
        speakBrowserFallback(text);
      } catch (fallbackErr) {
        console.error("TTS Error:", fallbackErr);
        stopLipSync();
        setAvatarState("idle");
      }
    }
  }, [setAvatarState, startLipSync, stopLipSync, speakBrowserFallback]);

  return { speak };
}
