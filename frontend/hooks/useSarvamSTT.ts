"use client";

import { useState, useRef, useCallback } from "react";
import { useAvatarStore } from "@/store/avatarStore";

const BACKEND_URL = "http://localhost:8000";

export type SarvamSTTState = "idle" | "recording" | "processing" | "error";

interface UseSarvamSTTOptions {
  onTranscript?: (text: string) => void;
}

export function useSarvamSTT({ onTranscript }: UseSarvamSTTOptions = {}) {
  const [state, setState] = useState<SarvamSTTState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const setAvatarState = useAvatarStore((s) => s.setAvatarState);
  const setIsListening = useAvatarStore((s) => s.setIsListening);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("processing");
        setAvatarState("thinking");

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const transcript = await transcribeWithSarvam(blob);

        setState("idle");
        setAvatarState("idle");
        setIsListening(false);

        if (transcript) {
          onTranscript?.(transcript);
        }
      };

      mediaRecorder.start();
      setState("recording");
      setAvatarState("listening");
      setIsListening(true);
    } catch (err) {
      console.error("Sarvam STT mic error:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [onTranscript, setAvatarState, setIsListening]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle") {
      startRecording();
    }
  }, [state, startRecording, stopRecording]);

  return { state, startRecording, stopRecording, toggleRecording };
}

// ── send webm blob → backend → Sarvam STT ───────────────────────────────────

async function transcribeWithSarvam(blob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    // Send as .wav filename — backend saves to temp .wav
    formData.append("audio", blob, "recording.wav");

    const res = await fetch(`${BACKEND_URL}/api/stt`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Sarvam STT error:", await res.text());
      return "";
    }

    const { transcript } = await res.json();
    return transcript || "";
  } catch (err) {
    console.error("Sarvam STT fetch error:", err);
    return "";
  }
}
