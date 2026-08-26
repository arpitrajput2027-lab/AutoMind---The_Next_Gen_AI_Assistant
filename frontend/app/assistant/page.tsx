"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Settings, Trash2, Mail, TerminalSquare, AlertCircle, Bot } from "lucide-react";

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
  const [model, setModel]                   = useState("gemini");
  const [voiceMode, setVoiceMode]           = useState(false);
  const [aiMode, setAiMode]                 = useState<"edge" | "sarvam">("edge");
  const [emailPreview, setEmailPreview]     = useState<EmailPreview | null>(null);
  const [isPaused, setIsPaused]             = useState(false);
  const [isStopping, setIsStopping]         = useState(false);
  const [showLog, setShowLog]               = useState(false);
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
      if(voiceMode) speak(msg.message);
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

    if (msg.type === "email_preview" && msg.preview) {
        setIsThinking(false);
        setIsStopping(false);
        stopThinking();
        setEmailPreview(msg.preview);
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
  }, [startTalking, startThinking, stopThinking, reactToTask, voiceMode, speak]);

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
    setIsStopping(true);
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

  return (
    <div className="h-screen flex bg-cream overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-ink text-cream flex flex-col flex-shrink-0 z-10 border-r border-ink shadow-2xl">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 bg-bronze rounded flex items-center justify-center font-bold text-cream font-serif text-xl shadow-sm">
              A
            </div>
            <span className="font-serif font-bold text-xl tracking-wide text-cream">
              Auto<span className="text-bronze">Mind</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
            <div className="label-mono mb-4 px-2 text-meta opacity-70">Workspace</div>
            
            <button 
                onClick={() => setShowLog(!showLog)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors label-mono ${showLog ? 'bg-cream/10 text-bronze' : 'text-muted hover:text-cream hover:bg-cream/5'}`}
            >
                <TerminalSquare size={16} />
                Execution Log
            </button>
            <button 
                onClick={() => { setMessages([]); setSteps([]); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors label-mono text-muted hover:text-cream hover:bg-cream/5"
            >
                <Trash2 size={16} />
                Clear Chat
            </button>
            
            {/* Action Controls */}
            {(isThinking || isStopping) && (
                <div className="mt-8 pt-4 border-t border-cream/10 space-y-2">
                    <div className="label-mono mb-4 px-2 text-meta opacity-70">Task Controls</div>
                    {!isStopping && (
                        <button
                            onClick={handlePauseResume}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors label-mono ${isPaused ? 'bg-success/20 text-success' : 'bg-bronze/20 text-bronze hover:bg-bronze/30'}`}
                        >
                            {isPaused ? <TerminalSquare size={16} /> : <AlertCircle size={16} />}
                            {isPaused ? "Resume" : "Pause"}
                        </button>
                    )}
                    <button
                        onClick={!isStopping ? handleStop : undefined}
                        disabled={isStopping}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors label-mono ${isStopping ? 'bg-red-500/10 text-red-400 opacity-70 cursor-not-allowed' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                    >
                        <AlertCircle size={16} className={isStopping ? 'animate-spin' : ''} />
                        {isStopping ? "Stopping..." : "Stop Task"}
                    </button>
                </div>
            )}
        </nav>

        <div className="p-4 border-t border-cream/10 space-y-4">
            <ModelSelector selected={model} onChange={handleModelChange} />
            
            <div className="flex items-center gap-2 justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-success shadow-[0_0_8px_rgba(95,115,80,0.8)]' : status === 'connecting' ? 'bg-bronze' : 'bg-red-500'}`} />
                    <span className="label-mono text-xs opacity-70 capitalize">{status}</span>
                </div>
                <Bot size={16} className="text-muted" />
            </div>
        </div>
      </aside>

      {/* ── Main Canvas ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden bg-cream relative">
        <div className="flex-1 flex flex-col w-full h-full p-6">
            <div className="w-full h-full max-w-5xl mx-auto flex gap-6">
                <div className="flex-1 min-w-0">
                    <ChatPanel
                        messages={messages}
                        isThinking={isThinking}
                        onSend={handleSend}
                        onStop={!isStopping ? handleStop : undefined}
                        voiceMode={voiceMode}
                        onVoiceModeToggle={() => setVoiceMode((v) => !v)}
                        aiMode={aiMode}
                        onAiModeToggle={() => setAiMode((m) => m === "edge" ? "sarvam" : "edge")}
                        sarvamSTTState={sarvamSTTState}
                        onSarvamSTTToggle={toggleSarvamSTT}
                    />
                </div>

                {/* Execution Log */}
                {showLog && (
                <div className="w-80 flex-shrink-0">
                    <ExecutionLog steps={steps} isThinking={isThinking} />
                </div>
                )}
            </div>
        </div>

        {/* ── 3D Avatar (floating, draggable) ─────────────────────────────────── */}
        <AvatarWindow />
      </main>

      {/* ── Email Preview Modal ──────────────────────────────────────────────── */}
      {emailPreview && (
        <EmailPreviewModal
          preview={emailPreview}
          onConfirm={handleEmailConfirm}
          onCancel={() => setEmailPreview(null)}
        />
      )}
    </div>
  );
}
