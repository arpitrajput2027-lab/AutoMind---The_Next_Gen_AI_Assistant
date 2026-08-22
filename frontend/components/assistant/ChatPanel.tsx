"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import VoiceButton from "./VoiceButton";

export interface FileCard {
  path: string;
  name: string;
  file_type: "html" | "code" | "text" | "docx";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  taskType?: string;
  timestamp: number;
  success?: boolean;
  fileCard?: FileCard;
}

const TASK_COLORS: Record<string, string> = {
  vscode:      "#00d9ff",
  system:      "#ff6b35",
  email:       "#a855f7",
  whatsapp:    "#00ff88",
  powerpoint:  "#ffbd2e",
  word:        "#00d9ff",
  youtube:     "#ff4444",
  chat:        "var(--text-secondary)",
};

const TASK_ICONS: Record<string, string> = {
  vscode:      "💻",
  system:      "⚙️",
  email:       "📧",
  whatsapp:    "💬",
  powerpoint:  "📊",
  word:        "📝",
  youtube:     "▶️",
  chat:        "🤖",
};

const QUICK_COMMANDS = [
  { label: "Write Python code", icon: "💻" },
  { label: "Set volume to 50%", icon: "🔊" },
  { label: "Send a WhatsApp message", icon: "💬" },
  { label: "Create a PowerPoint", icon: "📊" },
  { label: "Search YouTube", icon: "▶️" },
  { label: "Draft an email", icon: "📧" },
];

interface ChatPanelProps {
  messages: Message[];
  isThinking: boolean;
  onSend: (text: string) => void;
  voiceMode: boolean;
  onVoiceModeToggle: () => void;
  aiMode: "edge" | "sarvam";
  onAiModeToggle: () => void;
  sarvamSTTState: "idle" | "recording" | "processing" | "error";
  onSarvamSTTToggle: () => void;
}

export default function ChatPanel({
  messages,
  isThinking,
  onSend,
  voiceMode,
  onVoiceModeToggle,
  aiMode,
  onAiModeToggle,
  sarvamSTTState,
  onSarvamSTTToggle,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "rgba(3,7,13,0.7)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "32px", padding: "40px 0",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-syne)", fontWeight: 800,
                fontSize: "1.5rem", color: "#e8f4fd", marginBottom: "8px",
              }}>
                What can I do for you?
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "0.875rem",
                color: "var(--text-muted)",
              }}>
                Try a command below or type anything
              </div>
            </div>

            {/* Quick commands grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "10px", width: "100%",
            }}>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => onSend(cmd.label)}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(0,217,255,0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-display)", fontSize: "0.8rem",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-glow)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--cyan)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,217,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,217,255,0.04)";
                  }}
                >
                  <span>{cmd.icon}</span>
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "10px",
              alignItems: "flex-start",
              animation: "fadeInUp 0.3s ease forwards",
            }}
          >
            {/* Avatar dot */}
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: msg.role === "user"
                ? "linear-gradient(135deg,var(--cyan),#0099bb)"
                : "linear-gradient(135deg,#a855f7,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700,
              color: "white", flexShrink: 0,
            }}>
              {msg.role === "user" ? "U" : "A"}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: msg.role === "user"
                ? "16px 4px 16px 16px"
                : "4px 16px 16px 16px",
              background: msg.role === "user"
                ? "rgba(0,217,255,0.1)"
                : "rgba(168,85,247,0.08)",
              border: `1px solid ${msg.role === "user"
                ? "rgba(0,217,255,0.2)"
                : "rgba(168,85,247,0.15)"}`,
            }}>
              {/* Task type badge */}
              {msg.taskType && msg.taskType !== "chat" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  marginBottom: "6px",
                }}>
                  <span style={{ fontSize: "0.7rem" }}>
                    {TASK_ICONS[msg.taskType] || "🤖"}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                    color: TASK_COLORS[msg.taskType] || "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    {msg.taskType}
                  </span>
                </div>
              )}

              <p style={{
                fontFamily: "var(--font-display)", fontSize: "0.875rem",
                color: "#e8f4fd", lineHeight: 1.65,
                margin: 0, whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </p>

              {/* File card — shown when a file was created */}
              {msg.fileCard && (
                <div style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "rgba(0,217,255,0.05)",
                  border: "1px solid rgba(0,217,255,0.18)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                      {msg.fileCard.file_type === "html" ? "🌐"
                        : msg.fileCard.file_type === "docx" ? "📝"
                        : msg.fileCard.file_type === "code" ? "💻"
                        : "📄"}
                    </span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem",
                      color: "#c8e6f0", overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {msg.fileCard.name}
                    </span>
                  </div>
                  <Link
                    href={`/editor?path=${encodeURIComponent(msg.fileCard.path)}`}
                    target="_blank"
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                      color: "#fff",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Open Editor →
                  </Link>
                </div>
              )}

              <div style={{
                marginTop: "6px",
                fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                color: "var(--text-muted)",
                textAlign: msg.role === "user" ? "right" : "left",
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-start",
            animation: "fadeInUp 0.3s ease forwards",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg,#a855f7,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0,
            }}>A</div>
            <div style={{
              padding: "12px 16px",
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.15)",
              borderRadius: "4px 16px 16px 16px",
              display: "flex", gap: "5px", alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#a855f7",
                  animation: `bounce 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "16px",
        background: "rgba(0,5,10,0.6)",
      }}>
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-end",
        }}>
          {/* Voice button */}
          <VoiceButton
            onTranscript={(text) => {
              setInput(text);
              setTimeout(handleSend, 100);
            }}
            disabled={isThinking}
          />

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command or question... (Enter to send, Shift+Enter for newline)"
            disabled={isThinking}
            rows={1}
            style={{
              flex: 1,
              background: "rgba(0,5,10,0.8)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#e8f4fd",
              fontFamily: "var(--font-display)", fontSize: "0.875rem",
              outline: "none", resize: "none", lineHeight: 1.5,
              maxHeight: "120px", overflowY: "auto",
              transition: "border-color 0.2s",
              opacity: isThinking ? 0.5 : 1,
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-glow)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          />

          {/* AI Mode toggle — Edge ↔ Sarvam */}
          <button
            onClick={onAiModeToggle}
            title={`Switch to ${aiMode === "edge" ? "Sarvam" : "Edge"} AI mode`}
            style={{
              height: "40px", borderRadius: "20px",
              padding: "0 12px",
              border: `1px solid ${aiMode === "sarvam" ? "rgba(168,85,247,0.5)" : "var(--border-subtle)"}`,
              background: aiMode === "sarvam" ? "rgba(168,85,247,0.12)" : "transparent",
              color: aiMode === "sarvam" ? "#a855f7" : "var(--text-muted)",
              cursor: "pointer", display: "flex", alignItems: "center",
              gap: "5px", flexShrink: 0, transition: "all 0.2s",
              fontFamily: "var(--font-code)", fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            {aiMode === "sarvam" ? "SARVAM" : "EDGE"}
          </button>

          {/* Sarvam STT mic — only shown in sarvam mode */}
          {aiMode === "sarvam" && (
            <button
              onClick={onSarvamSTTToggle}
              title={
                sarvamSTTState === "recording" ? "Stop recording"
                : sarvamSTTState === "processing" ? "Processing…"
                : "Record with Sarvam STT"
              }
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                border: `1px solid ${
                  sarvamSTTState === "recording" ? "rgba(255,80,80,0.6)"
                  : sarvamSTTState === "processing" ? "rgba(168,85,247,0.5)"
                  : "rgba(168,85,247,0.3)"
                }`,
                background:
                  sarvamSTTState === "recording" ? "rgba(255,80,80,0.12)"
                  : sarvamSTTState === "processing" ? "rgba(168,85,247,0.12)"
                  : "transparent",
                color:
                  sarvamSTTState === "recording" ? "#ff5050"
                  : sarvamSTTState === "processing" ? "#a855f7"
                  : "#a855f7",
                cursor: sarvamSTTState === "processing" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0, fontSize: "1rem",
                animation: sarvamSTTState === "recording" ? "pulse-mic 1s ease infinite" : "none",
              }}
            >
              {sarvamSTTState === "processing" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
              ) : "🎙️"}
            </button>
          )}

          {/* Edge TTS voice toggle — only shown in edge mode */}
          {aiMode === "edge" && (
            <button
              onClick={onVoiceModeToggle}
              title={voiceMode ? "Voice responses ON" : "Voice responses OFF"}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                border: `1px solid ${voiceMode ? "rgba(0,255,136,0.5)" : "var(--border-subtle)"}`,
                background: voiceMode ? "rgba(0,255,136,0.1)" : "transparent",
                color: voiceMode ? "#00ff88" : "var(--text-muted)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0, fontSize: "1rem",
              }}
            >
              🔊
            </button>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            style={{
              width: "40px", height: "40px", borderRadius: "8px",
              background: (!input.trim() || isThinking)
                ? "rgba(0,217,255,0.1)"
                : "linear-gradient(135deg,var(--cyan),#0099bb)",
              border: "none",
              color: (!input.trim() || isThinking) ? "var(--text-muted)" : "var(--bg-void)",
              cursor: (!input.trim() || isThinking) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,80,80,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(255,80,80,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
