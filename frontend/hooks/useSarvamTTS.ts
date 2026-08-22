"use client";

import { useCallback } from "react";
import { useAvatarStore } from "@/store/avatarStore";

const BACKEND_URL = "http://localhost:8000";

export function useSarvamTTS() {
  const setAvatarState = useAvatarStore((s) => s.setAvatarState);
  const setMouthAmplitude = useAvatarStore((s) => s.setMouthAmplitude);

  const speak = useCallback(async (text: string, voice = "kavya") => {
    if (!text.trim()) return;

    // Split text into chunks ≤480 chars at sentence boundaries
    const chunks = splitText(text, 480);

    setAvatarState("speaking");

    for (const chunk of chunks) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunk, voice }),
        });

        if (!res.ok) {
          console.error("Sarvam TTS error:", await res.text());
          continue;
        }

        const { audio } = await res.json();
        if (!audio) continue;

        await playBase64Audio(audio, setMouthAmplitude);
      } catch (err) {
        console.error("Sarvam TTS chunk error:", err);
      }
    }

    setMouthAmplitude(0);
    setAvatarState("idle");
  }, [setAvatarState, setMouthAmplitude]);

  return { speak };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence + " ";
    } else {
      current += sentence + " ";
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function playBase64Audio(
  b64: string,
  onAmplitude: (v: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const ctx = new AudioContext();
      ctx.decodeAudioData(bytes.buffer, (buffer) => {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const data = new Uint8Array(analyser.frequencyBinCount);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        analyser.connect(ctx.destination);

        let rafId: number;
        const loop = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          onAmplitude(Math.min(avg / 80, 1));
          rafId = requestAnimationFrame(loop);
        };
        loop();

        source.onended = () => {
          cancelAnimationFrame(rafId);
          onAmplitude(0);
          ctx.close();
          resolve();
        };

        source.start(0);
      }, () => { resolve(); });
    } catch {
      resolve();
    }
  });
}
