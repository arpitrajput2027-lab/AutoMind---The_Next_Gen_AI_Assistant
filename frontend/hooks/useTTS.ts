"use client";

import { useCallback, useRef } from "react";
import { useAvatarStore } from "@/store/avatarStore";

export function useTTS() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setAvatarState = useAvatarStore((s) => s.setAvatarState);
  const setMouthAmplitude = useAvatarStore((s) => s.setMouthAmplitude);

  // Lip sync loop — audio amplitude se mouth drive karo
  const startLipSync = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      analyser.getByteFrequencyData(dataArray);

      // Average amplitude nikalo
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      // 0-1 range mein normalize karo
      const normalized = Math.min(avg / 80, 1);
      setMouthAmplitude(normalized);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
  }, [setMouthAmplitude]);

  // Lip sync band karo
  const stopLipSync = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setMouthAmplitude(0);
  }, [setMouthAmplitude]);

  // Main TTS function
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      setAvatarState("speaking");

      // TTS API call karo
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS API fail hui");

      const { audio } = await res.json();
      if (!audio) throw new Error("Audio nahi mila");

      // Base64 → ArrayBuffer convert karo
      const binaryStr = atob(audio);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Web Audio API setup karo
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Audio decode karo
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Analyser node — lip sync ke liye
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Source → Analyser → Output
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Lip sync shuru karo
      startLipSync(analyser);

      // Audio play karo
      source.start(0);

      // Audio khatam hone pe
      source.onended = () => {
        stopLipSync();
        setAvatarState("idle");
        audioContext.close();
        console.log("Audio khatam hua");
      };

    } catch (error) {
      console.error("TTS Error:", error);
      stopLipSync();
      setAvatarState("idle");
    }
  }, [setAvatarState, startLipSync, stopLipSync]);

  return { speak };
}