"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Trash2,
  TerminalSquare,
  AlertCircle,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";

import ChatPanel, { type Message } from "@/components/assistant/ChatPanel";
import ExecutionLog from "@/components/assistant/ExecutionLog";
import ModelSelector from "@/components/assistant/ModelSelector";
import EmailPreviewModal from "@/components/assistant/EmailPreview";
import RoleSelector, { type RoleInfo } from "@/components/assistant/RoleSelector";

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
  const [leftOpen, setLeftOpen]             = useState(true);
  const [rightOpen, setRightOpen]           = useState(true);
  const [roles, setRoles]                   = useState<RoleInfo[]>([]);
  const [activeRole, setActiveRole]         = useState<RoleInfo | null>(null);
  const stepsClearTimer                     = useRef<ReturnType<typeof setTimeout>>();

  const { startTalking, startThinking, stopThinking, reactToTask } = useAvatar();
  const { speak: speakEdge }   = useTTS();
  const { speak: speakSarvam } = useSarvamTTS();
  const speak = aiMode === "sarvam" ? speakSarvam : speakEdge;

  const handleSarvamTranscript = useCallback((text: string) => {
    handleSend(text);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { state: sarvamSTTState, toggleRecording: toggleSarvamSTT } =
    useSarvamSTT({ onTranscript: handleSarvamTranscript });

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
          sources: msg.sources,
        },
      ]);
      startTalking(msg.message);
      if (voiceMode) speak(msg.message);
      reactToTask(msg.task_type || "chat", msg.success !== false);

      clearTimeout(stepsClearTimer.current);
      stepsClearTimer.current = setTimeout(() => setSteps([]), 8000);
    }

    if (msg.type === "roles_list") {
      if (msg.roles) setRoles(msg.roles);
      if (msg.active) setActiveRole(msg.active);
    }

    if (msg.type === "role_switched" && msg.role) {
      setActiveRole(msg.role);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "system",
          content: `🎭 Role: ${msg.role!.emoji} ${msg.role!.name} — AI will now respond in this persona`,
          timestamp: Date.now(),
        },
      ]);
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
    if (msg.type === "resumed") setIsPaused(false);
  }, [startTalking, startThinking, stopThinking, reactToTask, voiceMode, speak]);

  const handleStep = useCallback((step: ExecutionStep) => {
    setSteps((prev) => [...prev, step]);
  }, []);

  const handleEmailPreview = useCallback((preview: EmailPreview) => {
    setEmailPreview(preview);
  }, []);

  const { status, send, sendCommand, switchModel, confirmEmail, switchRole } = useWebSocket({
    sessionId: SESSION_ID,
    onMessage: handleWsMessage,
    onStep: handleStep,
    onEmailPreview: handleEmailPreview,
  });

  const handleRoleSelect = useCallback((roleId: string) => {
    switchRole(roleId);
  }, [switchRole]);

  const handleCustomRole = useCallback((name: string, prompt?: string) => {
    switchRole("custom", name, prompt);
  }, [switchRole]);

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: "user", content: text, timestamp: Date.now() },
    ]);
    sendCommand(text, model, voiceMode);
  }, [sendCommand, model, voiceMode]);

  const handleModelChange = useCallback((m: string) => {
    setModel(m);
    switchModel(m);
  }, [switchModel]);

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
      {/* ── Left Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={`bg-ink text-cream flex flex-col flex-shrink-0 z-20 border-r border-ink shadow-2xl transition-all duration-300 ease-out overflow-hidden ${
          leftOpen ? "w-64" : "w-14"
        }`}
      >
        {/* Header / collapse toggle */}
        <div className={`flex items-center ${leftOpen ? "justify-between p-4" : "flex-col gap-3 py-4"}`}>
          {leftOpen ? (
            <Link href="/" className="flex items-center gap-3 no-underline min-w-0">
              <div className="w-8 h-8 bg-bronze rounded flex items-center justify-center font-bold text-cream font-serif text-xl shadow-sm flex-shrink-0">
                A
              </div>
              <span className="font-serif font-bold text-xl tracking-wide text-cream truncate">
                Auto<span className="text-bronze">Mind</span>
              </span>
            </Link>
          ) : (
            <Link href="/" className="w-8 h-8 bg-bronze rounded flex items-center justify-center font-bold text-cream font-serif text-xl shadow-sm no-underline">
              A
            </Link>
          )}
          <button
            onClick={() => setLeftOpen((v) => !v)}
            className="p-2 rounded-md text-muted hover:text-cream hover:bg-cream/10 transition-colors"
            title={leftOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {leftOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <nav className={`flex-1 py-2 space-y-1 ${leftOpen ? "px-3" : "px-2"}`}>
          {leftOpen && (
            <div className="label-mono mb-3 px-2 text-meta opacity-70">Workspace</div>
          )}

          <button
            onClick={() => setShowLog(!showLog)}
            title="Execution Log"
            className={`w-full flex items-center rounded-md transition-colors label-mono ${
              leftOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
            } ${showLog ? "bg-cream/10 text-bronze" : "text-muted hover:text-cream hover:bg-cream/5"}`}
          >
            <TerminalSquare size={16} />
            {leftOpen && <span>Execution Log</span>}
          </button>

          <button
            onClick={() => { setMessages([]); setSteps([]); }}
            title="Clear Chat"
            className={`w-full flex items-center rounded-md transition-colors label-mono text-muted hover:text-cream hover:bg-cream/5 ${
              leftOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
            }`}
          >
            <Trash2 size={16} />
            {leftOpen && <span>Clear Chat</span>}
          </button>

          {(isThinking || isStopping) && (
            <div className={`mt-6 pt-4 border-t border-cream/10 space-y-1 ${leftOpen ? "" : ""}`}>
              {leftOpen && (
                <div className="label-mono mb-3 px-2 text-meta opacity-70">Task Controls</div>
              )}
              {!isStopping && (
                <button
                  onClick={handlePauseResume}
                  title={isPaused ? "Resume" : "Pause"}
                  className={`w-full flex items-center rounded-md transition-colors label-mono ${
                    leftOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                  } ${isPaused ? "bg-success/20 text-success" : "bg-bronze/20 text-bronze hover:bg-bronze/30"}`}
                >
                  {isPaused ? <TerminalSquare size={16} /> : <AlertCircle size={16} />}
                  {leftOpen && <span>{isPaused ? "Resume" : "Pause"}</span>}
                </button>
              )}
              <button
                onClick={!isStopping ? handleStop : undefined}
                disabled={isStopping}
                title={isStopping ? "Stopping..." : "Stop Task"}
                className={`w-full flex items-center rounded-md transition-colors label-mono ${
                  leftOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                } ${isStopping ? "bg-red-500/10 text-red-400 opacity-70 cursor-not-allowed" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}
              >
                <AlertCircle size={16} className={isStopping ? "animate-spin" : ""} />
                {leftOpen && <span>{isStopping ? "Stopping..." : "Stop Task"}</span>}
              </button>
            </div>
          )}
        </nav>

        <div className={`border-t border-cream/10 space-y-3 ${leftOpen ? "p-4" : "p-2"}`}>
          {leftOpen ? (
            <ModelSelector selected={model} onChange={handleModelChange} />
          ) : (
            <button
              title={`Model: ${model}`}
              className="w-full flex justify-center p-2 rounded-md text-bronze hover:bg-cream/10"
            >
              <Bot size={16} />
            </button>
          )}

          <div className={`flex items-center ${leftOpen ? "gap-2 justify-between px-2" : "justify-center"}`}>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "connected"
                    ? "bg-success shadow-[0_0_8px_rgba(95,115,80,0.8)]"
                    : status === "connecting"
                    ? "bg-bronze"
                    : "bg-red-500"
                }`}
              />
              {leftOpen && (
                <span className="label-mono text-xs opacity-70 capitalize">{status}</span>
              )}
            </div>
            {leftOpen && <Bot size={16} className="text-muted" />}
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden bg-cream relative min-w-0">
        {/* Floating reopen buttons when sidebars collapsed */}
        {!rightOpen && (
          <button
            onClick={() => setRightOpen(true)}
            className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-black/10 shadow-soft text-ink hover:border-bronze hover:text-bronze transition-colors"
            title="Open roles panel"
          >
            <Sparkles size={14} />
            <span className="label-mono text-[0.65rem] hidden sm:inline">Roles</span>
            <PanelRightOpen size={14} />
          </button>
        )}

        <div className="flex-1 flex w-full h-full min-w-0">
          {/* Chat */}
          <div className="flex-1 min-w-0 p-4 md:p-5">
            <ChatPanel
              messages={messages}
              isThinking={isThinking}
              onSend={handleSend}
              onStop={!isStopping ? handleStop : undefined}
              voiceMode={voiceMode}
              onVoiceModeToggle={() => setVoiceMode((v) => !v)}
              aiMode={aiMode}
              onAiModeToggle={() => setAiMode((m) => (m === "edge" ? "sarvam" : "edge"))}
              sarvamSTTState={sarvamSTTState}
              onSarvamSTTToggle={toggleSarvamSTT}
              activeRoleLabel={activeRole ? `${activeRole.emoji} ${activeRole.name}` : undefined}
            />
          </div>

          {/* Right sidebar — Roles */}
          <aside
            className={`flex-shrink-0 h-full border-l border-black/5 bg-cream transition-all duration-300 ease-out overflow-hidden ${
              rightOpen ? "w-72 md:w-80" : "w-0"
            }`}
          >
            <div className="w-72 md:w-80 h-full flex flex-col p-4 gap-3">
              <div className="flex items-center justify-between">
                <span className="label-mono text-[0.65rem] text-muted">Personas</span>
                <button
                  onClick={() => setRightOpen(false)}
                  className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-black/5 transition-colors"
                  title="Collapse roles"
                >
                  <PanelRightClose size={16} />
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <RoleSelector
                  roles={roles}
                  activeRole={activeRole}
                  onSelect={handleRoleSelect}
                  onCustomRole={handleCustomRole}
                />
              </div>

              {showLog && (
                <div className="h-56 flex-shrink-0">
                  <ExecutionLog steps={steps} isThinking={isThinking} />
                </div>
              )}
            </div>
          </aside>
        </div>

        <AvatarWindow />
      </main>

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
