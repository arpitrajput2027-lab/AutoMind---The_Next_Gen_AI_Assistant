"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type WsStatus = "connecting" | "connected" | "disconnected" | "error";

export interface ExecutionStep {
  step: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
  timestamp: number;
}

export interface EmailPreview {
  to: string;
  from: string;
  subject: string;
  body: string;
}

export interface FilePreview {
  path: string;
  content: string;
  file_type: "html" | "code" | "text" | "docx";
}

export interface WsMessage {
  type: string;
  message?: string;
  task_type?: string;
  step?: string;
  status?: string;
  detail?: string;
  preview?: EmailPreview;
  session_id?: string;
  model?: string;
  success?: boolean;
}

interface UseWebSocketOptions {
  sessionId: string;
  onMessage?: (msg: WsMessage) => void;
  onStep?: (step: ExecutionStep) => void;
  onEmailPreview?: (preview: EmailPreview) => void;
}

export function useWebSocket({
  sessionId,
  onMessage,
  onStep,
  onEmailPreview,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const intentionalClose = useRef(false);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(`${WS_URL}/ws/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      intentionalClose.current = false;
    };

    ws.onclose = () => {
      setStatus("disconnected");
      if (!intentionalClose.current) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => setStatus("error");

    ws.onmessage = (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);

        if (data.type === "execution_step" && onStep) {
          onStep({
            step: data.step || "",
            status: (data.status as ExecutionStep["status"]) || "running",
            detail: data.detail,
            timestamp: Date.now(),
          });
        } else if (data.type === "email_preview" && onEmailPreview && data.preview) {
          onEmailPreview(data.preview);
        } else if (onMessage) {
          onMessage(data);
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };
  }, [sessionId, WS_URL, onMessage, onStep, onEmailPreview]);

  const disconnect = useCallback(() => {
    intentionalClose.current = true;
    clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
  }, []);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const sendCommand = useCallback(
    (text: string, model: string, voiceMode = false) => {
      send({ type: "command", text, model, voice_mode: voiceMode });
    },
    [send]
  );

  const switchModel = useCallback(
    (model: string) => {
      send({ type: "model_switch", model });
    },
    [send]
  );

  const confirmEmail = useCallback(
    (preview: EmailPreview) => {
      send({ type: "email_confirm", preview });
    },
    [send]
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, send, sendCommand, switchModel, confirmEmail };
}
