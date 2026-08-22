"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface FilePreview {
  path: string;
  content: string;
  file_type: "html" | "code" | "text" | "docx";
}

interface FilePreviewPanelProps {
  preview: FilePreview | null;
  onEditInstruction: (path: string, instruction: string) => void;
  isEditing: boolean;
}

export default function FilePreviewPanel({
  preview,
  onEditInstruction,
  isEditing,
}: FilePreviewPanelProps) {
  const [instruction, setInstruction] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset to preview tab when file changes
  useEffect(() => {
    setActiveTab(preview?.file_type === "html" ? "preview" : "code");
  }, [preview?.path]);

  const handleSend = useCallback(() => {
    if (!instruction.trim() || !preview) return;
    onEditInstruction(preview.path, instruction.trim());
    setInstruction("");
  }, [instruction, preview, onEditInstruction]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fileName = preview?.path.split(/[\\/]/).pop() ?? "";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  const langLabel: Record<string, string> = {
    py: "Python", js: "JavaScript", ts: "TypeScript",
    html: "HTML", css: "CSS", json: "JSON", txt: "Text", docx: "Word Doc",
  };

  if (!preview) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "rgba(4,10,20,0.6)",
        border: "1px solid rgba(0,217,255,0.08)",
        borderRadius: "12px",
        color: "var(--text-muted)",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.2" opacity={0.3}>
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.72rem",
          letterSpacing: "0.06em" }}>
          File preview appears here
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.62rem",
          opacity: 0.5, textAlign: "center", maxWidth: "200px", lineHeight: 1.5 }}>
          Create a website, document, or code file to start editing
        </span>
      </div>
    );
  }

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "rgba(4,10,20,0.6)",
      border: "1px solid rgba(0,217,255,0.12)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(0,217,255,0.08)",
        background: "rgba(0,217,255,0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileIcon ext={ext} />
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.78rem",
              color: "#e8f4fd",
              fontWeight: 600,
            }}>{fileName}</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.58rem",
              color: "rgba(0,217,255,0.45)",
              marginTop: "1px",
              letterSpacing: "0.06em",
            }}>{langLabel[ext] ?? ext.toUpperCase()}</div>
          </div>
        </div>

        {/* Tabs — only for HTML */}
        {preview.file_type === "html" && (
          <div style={{ display: "flex", gap: "4px" }}>
            {(["preview", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: activeTab === tab
                    ? "rgba(0,217,255,0.4)" : "rgba(0,217,255,0.1)",
                  background: activeTab === tab
                    ? "rgba(0,217,255,0.1)" : "transparent",
                  color: activeTab === tab ? "#00d9ff" : "var(--text-muted)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.62rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {preview.file_type === "html" && activeTab === "preview" ? (
          <iframe
            srcDoc={preview.content}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        ) : (
          <pre style={{
            margin: 0,
            padding: "14px",
            height: "100%",
            overflowY: "auto",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.75rem",
            lineHeight: 1.65,
            color: "#c8e6f0",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "transparent",
          }}>
            {preview.content}
          </pre>
        )}

        {/* Editing overlay */}
        {isEditing && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4,10,20,0.7)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            flexDirection: "column",
          }}>
            <SpinnerIcon />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.7rem",
              color: "#a855f7",
              letterSpacing: "0.06em",
            }}>Applying edit…</span>
          </div>
        )}
      </div>

      {/* ── Edit Prompt Bar ── */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(0,217,255,0.08)",
        background: "rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: "0.58rem",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "rgba(0,217,255,0.35)",
          letterSpacing: "0.08em",
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Edit this file
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g. "Change name to Arpit", "Add dark background", "Update title"`}
            rows={2}
            disabled={isEditing}
            style={{
              flex: 1,
              padding: "8px 11px",
              background: "rgba(0,5,15,0.7)",
              border: "1px solid rgba(0,217,255,0.12)",
              borderRadius: "8px",
              color: "#e8f4fd",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.75rem",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              opacity: isEditing ? 0.5 : 1,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(0,217,255,0.12)")}
          />
          <button
            onClick={handleSend}
            disabled={!instruction.trim() || isEditing}
            title="Apply edit (Enter)"
            style={{
              width: "36px",
              borderRadius: "8px",
              background: (!instruction.trim() || isEditing)
                ? "rgba(168,85,247,0.1)"
                : "linear-gradient(135deg, #a855f7, #7c3aed)",
              border: "none",
              color: (!instruction.trim() || isEditing) ? "#7c3aed" : "#fff",
              cursor: (!instruction.trim() || isEditing) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.56rem",
          color: "rgba(0,217,255,0.2)",
          marginTop: "5px",
        }}>
          Enter to apply · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    html: "#ff6b35", py: "#00d9ff", js: "#ffbd2e",
    ts: "#00aaff", css: "#a855f7", docx: "#2563eb",
    txt: "#7fa8c9",
  };
  const color = colors[ext] ?? "#7fa8c9";
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "7px",
      background: `${color}18`,
      border: `1px solid ${color}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "fp-spin 0.8s linear infinite" }}>
      <style>{`@keyframes fp-spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
    </svg>
  );
}
