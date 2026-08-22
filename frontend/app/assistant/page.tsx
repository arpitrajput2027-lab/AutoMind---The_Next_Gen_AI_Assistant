"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

import dynamic from "next/dynamic";
import ChatPanel, { type Message } from "@/components/assistant/ChatPanel";
import ExecutionLog from "@/components/assistant/ExecutionLog";
import ModelSelector from "@/components/assistant/ModelSelector";
import EmailPreviewModal from "@/components/assistant/EmailPreview";

import { useWebSocket, type ExecutionStep, type WsMessage, type EmailPreview, type FilePreview } from "@/hooks/useWebSocket";
import { useAvatar } from "@/hooks/useAvatar";
import { useTTS } from "@/hooks/useTTS";
import { useSarvamTTS } from "@/hooks/useSarvamTTS";
import { useSarvamSTT } from "@/hooks/useSarvamSTT";

const AvatarWindow = dynamic(
  () => import("@/components/assistant/AvatarWindow"),
  { ssr: false }
);

const SESSION_ID = uuidv4();

export default function AssistantPage() {
  const [messages, setMessages]             = useState<Message[]>([]);
  const [steps, setSteps]                   = useState<ExecutionStep[]>([]);
  const [isThinking, setIsThinking]         = useState(false);
  const [model, setModel]                   = useState("sarvam");
  const [voiceMode, setVoiceMode]           = useState(false);
  const [aiMode, setAiMode]                 = useState<"edge" | "sarvam">("edge");
  const [emailPreview, setEmailPreview]     = useState<EmailPreview | null>(null);
  const [isPaused, setIsPaused]             = useState(false);
  const [isStopping, setIsStopping]         = useState(false);
  const [showLog, setShowLog]               = useState(true);
  const stepsClearTimer                     = useRef<ReturnType<typeof setTimeout>>();

  const { avatarState, startTalking, startThinking, stopThinking, reactToTask } = useAvatar();
  const { speak: speakEdge }   = useTTS();
  const { speak: speakSarvam } = useSarvamTTS();
  const speak = aiMode === "sarvam" ? speakSarvam : speakEdge;

  // Sarvam STT — auto-sends transcript as command
  const handleSarvamTranscript = useCallback((text: string) => {
    handleSend(text);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { state: sarvamSTTState, toggleRecording: toggleSarvamSTT } =
    useSarvamSTT({ onTranscript: handleSarvamTranscript });

  // ── WS message handler ──────────────────────────────────────────────────────
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === "thinking") {
      setIsThinking(true);
      startThinking();
      setSteps([]);
    }

    if (msg.type === "response" && msg.message) {
      setIsThinking(false);
      setIsStopping(false);
      stopThinking();
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: msg.message!,
          taskType: msg.task_type,
          timestamp: Date.now(),
          success: msg.success !== false,
        },
      ]);
      startTalking(msg.message);
      speak(msg.message);
      reactToTask(msg.task_type || "chat", msg.success !== false);

      // Auto-clear steps after 8s
      clearTimeout(stepsClearTimer.current);
      stepsClearTimer.current = setTimeout(() => setSteps([]), 8000);
    }

    if (msg.type === "error" && msg.message) {
      setIsThinking(false);
      setIsStopping(false);
      stopThinking();
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: `⚠️ ${msg.message}`,
          taskType: "error",
          timestamp: Date.now(),
          success: false,
        },
      ]);
    }

    if (msg.type === "model_switched") {
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: "system", content: `✓ Switched to ${msg.model}`, timestamp: Date.now() },
      ]);
    }

    if (msg.type === "file_preview") {
      const fp = msg as unknown as FilePreview & { type: string };
      const name = fp.path?.split(/[\\/]/).pop() ?? "file";
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: `File ready: ${name}`,
          taskType: "file",
          timestamp: Date.now(),
          success: true,
          fileCard: { path: fp.path, name, file_type: fp.file_type },
        },
      ]);
    }

    if (msg.type === "stopped") {
      setIsThinking(false);
      setIsStopping(false);
      setIsPaused(false);
      stopThinking();
    }

    if (msg.type === "paused") setIsPaused(true);
    if (msg.type === "resumed") { setIsPaused(false); }
  }, [startTalking, startThinking, stopThinking, reactToTask]);

  const handleStep = useCallback((step: ExecutionStep) => {
    setSteps((prev) => [...prev, step]);
  }, []);

  const handleEmailPreview = useCallback((preview: EmailPreview) => {
    setEmailPreview(preview);
  }, []);

  const { status, send, sendCommand, switchModel, confirmEmail } = useWebSocket({
    sessionId: SESSION_ID,
    onMessage: handleWsMessage,
    onStep: handleStep,
    onEmailPreview: handleEmailPreview,
  });

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: "user", content: text, timestamp: Date.now() },
    ]);
    sendCommand(text, model, voiceMode);
  }, [sendCommand, model, voiceMode]);

  // ── Model switch ────────────────────────────────────────────────────────────
  const handleModelChange = useCallback((m: string) => {
    setModel(m);
    switchModel(m);
  }, [switchModel]);

  // ── Email send ──────────────────────────────────────────────────────────────
  const handleEmailConfirm = useCallback((preview: EmailPreview) => {
    confirmEmail(preview);
    setEmailPreview(null);
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(), role: "assistant",
        content: `📧 Sending email to ${preview.to}...`,
        taskType: "email", timestamp: Date.now(),
      },
    ]);
  }, [confirmEmail]);

  // ── Stop / Pause ────────────────────────────────────────────────────────────

  const handleStop = useCallback(() => {
    send({ type: "stop" });
    setIsStopping(true);   // show "Stopping…" — buttons stay visible until "stopped" arrives
  }, [send]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      send({ type: "resume" });
      setIsPaused(false);
    } else {
      send({ type: "pause" });
      setIsPaused(true);
    }
  }, [send, isPaused]);


  const STATUS_COLOR = { connected: "#00ff88", connecting: "#ffbd2e", disconnected: "#ff4444", error: "#ff4444" };
  const STATUS_LABEL = { connected: "Connected", connecting: "Connecting...", disconnected: "Offline", error: "Error" };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "var(--bg-void)", overflow: "hidden",
    }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: "56px", flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(3,7,13,0.95)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}>
        {/* Logo + back */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{
            textDecoration: "none", display: "flex",
            alignItems: "center", gap: "8px",
          }}>
            <div style={{
              width: "30px", height: "30px",
              background: "linear-gradient(135deg,#00d9ff,#00ff88)",
              borderRadius: "6px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "14px", fontWeight: 800,
              color: "#03070d", fontFamily: "var(--font-syne)",
            }}>A</div>
            <span style={{
              fontFamily: "var(--font-syne)", fontWeight: 800,
              fontSize: "1rem", color: "#e8f4fd",
            }}>
              Auto<span style={{ color: "#00d9ff" }}>Mind</span>
            </span>
          </Link>

          {/* WS Status */}
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: `${STATUS_COLOR[status]}10`,
            border: `1px solid ${STATUS_COLOR[status]}25`,
            borderRadius: "20px", padding: "3px 10px",
          }}>
            <div style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: STATUS_COLOR[status],
              boxShadow: `0 0 6px ${STATUS_COLOR[status]}`,
            }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.65rem",
              color: STATUS_COLOR[status],
            }}>
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        {/* Model selector */}
        <ModelSelector selected={model} onChange={handleModelChange} />

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setShowLog((s) => !s)}
            style={{
              padding: "6px 14px", borderRadius: "4px",
              border: "1px solid var(--border-subtle)",
              background: showLog ? "rgba(0,217,255,0.08)" : "transparent",
              color: showLog ? "var(--cyan)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)", fontSize: "0.68rem",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {showLog ? "Hide Log" : "Show Log"}
          </button>
          {/* Stop / Pause — shown during execution OR while stopping */}
          {(isThinking || isStopping) && (
            <>
              {/* Pause/Resume — only when not stopping */}
              {!isStopping && (
                <button
                  onClick={handlePauseResume}
                  style={{
                    padding: "6px 14px", borderRadius: "4px",
                    border: `1px solid ${isPaused ? "rgba(0,255,136,0.4)" : "rgba(255,189,46,0.4)"}`,
                    background: isPaused ? "rgba(0,255,136,0.08)" : "rgba(255,189,46,0.08)",
                    color: isPaused ? "#00ff88" : "#ffbd2e",
                    fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                    cursor: "pointer", transition: "all 0.2s", display: "flex",
                    alignItems: "center", gap: "5px",
                  }}
                >
                  {isPaused ? (
                    <><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Resume</>
                  ) : (
                    <><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause</>
                  )}
                </button>
              )}
              <button
                onClick={!isStopping ? handleStop : undefined}
                disabled={isStopping}
                style={{
                  padding: "6px 14px", borderRadius: "4px",
                  border: "1px solid rgba(255,68,68,0.4)",
                  background: isStopping ? "rgba(255,68,68,0.15)" : "rgba(255,68,68,0.08)",
                  color: "#ff4444",
                  fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                  cursor: isStopping ? "not-allowed" : "pointer",
                  transition: "all 0.2s", display: "flex",
                  alignItems: "center", gap: "5px",
                  opacity: isStopping ? 0.7 : 1,
                }}
              >
                {isStopping ? (
                  <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Stopping…</>
                ) : (
                  <><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Stop</>
                )}
              </button>
            </>
          )}

          <button
            onClick={() => { setMessages([]); setSteps([]); }}
            style={{
              padding: "6px 14px", borderRadius: "4px",
              border: "1px solid var(--border-subtle)",
              background: "transparent", color: "var(--text-muted)",
              fontFamily: "var(--font-mono)", fontSize: "0.68rem",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            Clear
          </button>
        </div>
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "grid", overflow: "hidden",
        gridTemplateColumns: showLog ? "1fr 320px" : "1fr",
        gap: "12px", padding: "12px",
        transition: "grid-template-columns 0.35s ease",
      }}>
        {/* Chat Panel */}
        <ChatPanel
          messages={messages}
          isThinking={isThinking}
          onSend={handleSend}
          voiceMode={voiceMode}
          onVoiceModeToggle={() => setVoiceMode((v) => !v)}
          aiMode={aiMode}
          onAiModeToggle={() => setAiMode((m) => m === "edge" ? "sarvam" : "edge")}
          sarvamSTTState={sarvamSTTState}
          onSarvamSTTToggle={toggleSarvamSTT}
        />

        {/* Execution Log */}
        {showLog && (
          <ExecutionLog steps={steps} isThinking={isThinking} />
        )}
      </div>

      {/* ── 3D Avatar (floating, draggable) ─────────────────────────────────── */}
        <AvatarWindow />

      {/* ── Email Preview Modal ──────────────────────────────────────────────── */}
      {emailPreview && (
        <EmailPreviewModal
          preview={emailPreview}
          onConfirm={handleEmailConfirm}
          onCancel={() => setEmailPreview(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
