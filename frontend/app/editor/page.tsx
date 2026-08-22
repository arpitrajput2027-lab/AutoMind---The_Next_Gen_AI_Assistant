"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface EditLogEntry {
  instruction: string;
  timestamp: number;
  success: boolean;
  message?: string;
}

type FileType = "html" | "code" | "text" | "docx";

const EXT_ICON: Record<string, string> = {
  html: "🌐", htm: "🌐",
  py: "🐍", js: "📜", ts: "📜", tsx: "📜", jsx: "📜",
  css: "🎨", json: "📋",
  docx: "📝", doc: "📝",
  txt: "📄",
};

function FileIcon({ ext }: { ext: string }) {
  return <span style={{ fontSize: "1.1rem" }}>{EXT_ICON[ext] ?? "📄"}</span>;
}

function SpinnerIcon({ size = 20, color = "#a855f7" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "ed-spin 0.8s linear infinite", flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  );
}

// ── Inner content (needs Suspense for useSearchParams) ────────────────────────
function EditorContent() {
  const searchParams = useSearchParams();
  const path = searchParams.get("path") ?? "";

  const [content, setContent]     = useState("");
  const [fileType, setFileType]   = useState<FileType>("text");
  const [fileName, setFileName]   = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [editLog, setEditLog]     = useState<EditLogEntry[]>([]);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const logBottomRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);

  // ── Load file ───────────────────────────────────────────────────────────────
  const loadFile = useCallback(async () => {
    if (!path) { setError("No file path provided."); setIsLoading(false); return; }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/api/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setContent(data.content ?? "");
      setFileType(data.file_type ?? "text");
      setFileName(data.name ?? path.split(/[\\/]/).pop() ?? "file");
      setActiveTab(data.file_type === "html" ? "preview" : "code");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => { loadFile(); }, [loadFile]);

  // Auto-scroll edit log
  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [editLog]);

  // ── Apply edit ──────────────────────────────────────────────────────────────
  const handleApplyEdit = useCallback(async () => {
    const instr = instruction.trim();
    if (!instr || isEditing || isLoading) return;
    setInstruction("");
    setIsEditing(true);

    try {
      const res = await fetch("http://localhost:8000/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, instruction: instr }),
      });
      const data = await res.json();
      if (data.content !== undefined) setContent(data.content);
      setEditLog((prev) => [
        ...prev,
        { instruction: instr, timestamp: Date.now(), success: data.success !== false, message: data.message },
      ]);
    } catch (e: unknown) {
      setEditLog((prev) => [
        ...prev,
        { instruction: instr, timestamp: Date.now(), success: false, message: String(e) },
      ]);
    } finally {
      setIsEditing(false);
      inputRef.current?.focus();
    }
  }, [instruction, isEditing, isLoading, path]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleApplyEdit(); }
  };

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const canApply = !!instruction.trim() && !isEditing && !isLoading;

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "var(--bg-void)", overflow: "hidden",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <style>{`
        @keyframes ed-spin { to { transform: rotate(360deg); } }
        @keyframes ed-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: "52px", flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 20px", gap: "14px",
        background: "rgba(3,7,13,0.97)",
        borderBottom: "1px solid var(--border-subtle)",
        zIndex: 10,
      }}>
        {/* Logo / back */}
        <Link href="/assistant" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "6px",
            background: "linear-gradient(135deg,#00d9ff,#00ff88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 800, color: "#03070d",
          }}>A</div>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.9rem", color: "#e8f4fd" }}>
            Auto<span style={{ color: "#00d9ff" }}>Mind</span>
          </span>
        </Link>

        <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileIcon ext={ext} />
          <span style={{ fontSize: "0.82rem", color: "#e8f4fd", fontWeight: 600 }}>{fileName}</span>
          <span style={{ fontSize: "0.62rem", color: "rgba(0,217,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {fileType}
          </span>
        </div>

        {/* Preview / Code tabs — only for HTML */}
        {fileType === "html" && !isLoading && (
          <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
            {(["preview", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "4px 14px", borderRadius: "6px",
                  border: `1px solid ${activeTab === tab ? "rgba(0,217,255,0.4)" : "rgba(0,217,255,0.1)"}`,
                  background: activeTab === tab ? "rgba(0,217,255,0.1)" : "transparent",
                  color: activeTab === tab ? "#00d9ff" : "var(--text-muted)",
                  fontSize: "0.62rem", cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  transition: "all 0.15s",
                }}
              >{tab}</button>
            ))}
          </div>
        )}

        {/* Reload button */}
        {!isLoading && (
          <button
            onClick={loadFile}
            title="Reload file"
            style={{
              marginLeft: fileType !== "html" ? "auto" : undefined,
              padding: "5px 10px", borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              background: "transparent", color: "var(--text-muted)",
              fontSize: "0.62rem", cursor: "pointer", letterSpacing: "0.06em",
            }}
          >
            ↺ Reload
          </button>
        )}
      </header>

      {/* ── Two-panel layout ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", overflow: "hidden" }}>

        {/* ── LEFT PANEL — Instructions ──────────────────────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column",
          borderRight: "1px solid var(--border-subtle)",
          overflow: "hidden",
          background: "rgba(3,7,13,0.85)",
        }}>
          {/* Panel header */}
          <div style={{
            padding: "12px 16px", flexShrink: 0,
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#a855f7",
              boxShadow: "0 0 6px #a855f7",
            }} />
            <span style={{ fontSize: "0.62rem", color: "rgba(168,85,247,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Edit Instructions
            </span>
          </div>

          {/* Edit log */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {editLog.length === 0 ? (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: "40px 16px",
                color: "var(--text-muted)", lineHeight: 1.8,
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>✏️</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(168,85,247,0.5)" }}>
                  Describe a change below
                </div>
                <div style={{ marginTop: "6px", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)" }}>
                  e.g. "Change the heading to Welcome"<br />
                  "Make the background dark blue"<br />
                  "Update name to Arpit"
                </div>
              </div>
            ) : editLog.map((entry, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  background: entry.success ? "rgba(0,217,255,0.04)" : "rgba(255,68,68,0.04)",
                  border: `1px solid ${entry.success ? "rgba(0,217,255,0.12)" : "rgba(255,68,68,0.15)"}`,
                  borderRadius: "8px",
                  animation: "ed-fadein 0.25s ease forwards",
                }}
              >
                <div style={{ fontSize: "0.73rem", color: "#e8f4fd", lineHeight: 1.5, marginBottom: "5px" }}>
                  {entry.instruction}
                </div>
                <div style={{
                  fontSize: "0.58rem",
                  color: entry.success ? "rgba(0,255,136,0.6)" : "rgba(255,68,68,0.6)",
                  display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <span>{entry.success ? "✓ Applied" : "✗ Failed"}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ opacity: 0.5 }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            <div ref={logBottomRef} />
          </div>

          {/* ── Instruction input ─────────────────────────────────────────── */}
          <div style={{
            padding: "12px 14px", flexShrink: 0,
            borderTop: "1px solid var(--border-subtle)",
            background: "rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontSize: "0.58rem", color: "rgba(168,85,247,0.4)", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              What should change?
            </div>
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g. "Change heading to Hello World"\n"Add dark background"\n"Replace Arpit with my name"`}
              rows={3}
              disabled={isEditing || isLoading}
              style={{
                width: "100%", padding: "10px 12px",
                background: "rgba(0,5,15,0.8)",
                border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: "8px", color: "#e8f4fd",
                fontSize: "0.75rem", outline: "none",
                resize: "none", lineHeight: 1.55,
                boxSizing: "border-box",
                opacity: (isEditing || isLoading) ? 0.5 : 1,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(168,85,247,0.2)")}
            />
            <button
              onClick={handleApplyEdit}
              disabled={!canApply}
              style={{
                marginTop: "8px", width: "100%", padding: "9px 0",
                borderRadius: "8px", border: "none",
                background: canApply
                  ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                  : "rgba(168,85,247,0.12)",
                color: canApply ? "#fff" : "#7c3aed",
                fontSize: "0.72rem", fontWeight: 700,
                cursor: canApply ? "pointer" : "not-allowed",
                letterSpacing: "0.06em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                transition: "all 0.2s",
              }}
            >
              {isEditing ? (
                <><SpinnerIcon size={14} color="#fff" /> Applying…</>
              ) : (
                "Apply Edit  ↵"
              )}
            </button>
            <div style={{
              marginTop: "5px", fontSize: "0.55rem",
              color: "rgba(0,217,255,0.18)", textAlign: "center",
            }}>
              Enter to apply · Shift+Enter for newline
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Preview ───────────────────────────────────────────── */}
        <div style={{ position: "relative", overflow: "hidden", background: "rgba(4,10,20,0.5)" }}>
          {isLoading ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "14px",
            }}>
              <SpinnerIcon size={30} />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Loading file…</span>
            </div>
          ) : error ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "12px", padding: "40px",
            }}>
              <span style={{ fontSize: "2rem" }}>⚠️</span>
              <span style={{ fontSize: "0.78rem", color: "#ff4444", textAlign: "center" }}>{error}</span>
              <button
                onClick={loadFile}
                style={{
                  padding: "7px 18px", borderRadius: "6px",
                  border: "1px solid rgba(255,68,68,0.3)",
                  background: "transparent", color: "#ff4444",
                  fontSize: "0.7rem", cursor: "pointer",
                }}
              >Retry</button>
            </div>
          ) : fileType === "html" && activeTab === "preview" ? (
            <iframe
              srcDoc={content}
              style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview"
            />
          ) : (
            <pre style={{
              margin: 0, padding: "24px 28px",
              height: "100%", overflowY: "auto",
              fontSize: "0.8rem", lineHeight: 1.7,
              color: "#c8e6f0", whiteSpace: "pre-wrap", wordBreak: "break-word",
              background: "transparent", boxSizing: "border-box",
            }}>
              {content}
            </pre>
          )}

          {/* Editing overlay */}
          {isEditing && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(4,10,20,0.75)",
              backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "14px",
            }}>
              <SpinnerIcon size={34} />
              <span style={{ fontSize: "0.75rem", color: "#a855f7", letterSpacing: "0.06em" }}>
                Applying your edit…
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense (required for useSearchParams in Next.js 14) ───
export default function EditorPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-void)", color: "var(--text-muted)",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem",
      }}>
        Loading editor…
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
