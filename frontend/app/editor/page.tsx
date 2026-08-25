"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Globe,
  Code2,
  File,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit3,
  Eye,
  AlignLeft,
} from "lucide-react";

interface EditLogEntry {
  instruction: string;
  timestamp: number;
  success: boolean;
  message?: string;
}

type FileType = "html" | "code" | "text" | "docx";

const EXT_TO_ICON: Record<string, React.ReactNode> = {
  html: <Globe size={16} />, htm: <Globe size={16} />,
  py: <Code2 size={16} />, js: <Code2 size={16} />, ts: <Code2 size={16} />,
  tsx: <Code2 size={16} />, jsx: <Code2 size={16} />,
  css: <FileText size={16} />, json: <FileText size={16} />,
  docx: <FileText size={16} />, doc: <FileText size={16} />,
  txt: <AlignLeft size={16} />,
};

function FileIconComp({ ext }: { ext: string }) {
  return <span className="text-bronze">{EXT_TO_ICON[ext] ?? <File size={16} />}</span>;
}

// ── Inner content (needs Suspense for useSearchParams) ────────────────────────
function EditorContent() {
  const searchParams = useSearchParams();
  const path = searchParams.get("path") ?? "";

  const [content, setContent]         = useState("");
  const [fileType, setFileType]       = useState<FileType>("text");
  const [fileName, setFileName]       = useState("Loading...");
  const [isLoading, setIsLoading]     = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [instruction, setInstruction] = useState("");
  const [editLog, setEditLog]         = useState<EditLogEntry[]>([]);
  const [error, setError]             = useState("");
  const [activeTab, setActiveTab]     = useState<"preview" | "code">("preview");

  const logBottomRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);

  // ── Load file ─────────────────────────────────────────────────────────────
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

  // ── Apply edit ─────────────────────────────────────────────────────────────
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
    <div className="h-screen flex flex-col bg-cream overflow-hidden">
      <style>{`
        @keyframes ed-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .ed-entry { animation: ed-fadein 0.25s ease forwards; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 flex-shrink-0 flex items-center gap-4 px-6 bg-ink border-b border-cream/10 z-10">
        <Link
          href="/assistant"
          className="flex items-center gap-2 no-underline text-cream/70 hover:text-cream transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-serif font-bold text-lg">
            Auto<span className="text-bronze">Mind</span>
          </span>
        </Link>

        <div className="w-px h-5 bg-cream/10" />

        <div className="flex items-center gap-2">
          <FileIconComp ext={ext} />
          <span className="font-mono text-sm text-cream font-medium">{fileName}</span>
          <span className="label-mono text-[0.6rem] text-bronze/60 uppercase tracking-widest px-1.5 py-0.5 bg-bronze/10 rounded">
            {fileType}
          </span>
        </div>

        {/* Preview / Code tabs — only for HTML */}
        {fileType === "html" && !isLoading && (
          <div className="flex gap-2 ml-auto">
            {(["preview", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md label-mono text-[0.65rem] transition-colors border ${
                  activeTab === tab
                    ? "bg-bronze/10 text-bronze border-bronze/30"
                    : "text-cream/50 border-cream/10 hover:text-cream/80 hover:border-cream/20"
                }`}
              >
                {tab === "preview" ? <Eye size={12} /> : <Code2 size={12} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Reload button */}
        {!isLoading && (
          <button
            onClick={loadFile}
            title="Reload file"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md label-mono text-[0.65rem] text-cream/50 border border-cream/10 hover:text-cream/80 hover:border-cream/20 transition-colors ${fileType !== "html" ? "ml-auto" : ""}`}
          >
            <RefreshCw size={12} />
            Reload
          </button>
        )}
      </header>

      {/* ── Two-panel layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: "360px 1fr" }}>

        {/* ── LEFT PANEL — Instructions ────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-black/5 overflow-hidden bg-white">
          {/* Panel header */}
          <div className="px-5 py-3 flex-shrink-0 border-b border-black/5 flex items-center gap-2 bg-parchment">
            <Edit3 size={14} className="text-bronze" />
            <span className="label-mono text-ink">Edit Instructions</span>
          </div>

          {/* Edit log */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {editLog.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-4">
                <div className="w-12 h-12 rounded-xl bg-bronze/10 flex items-center justify-center text-bronze">
                  <Edit3 size={22} />
                </div>
                <div>
                  <p className="font-sans text-sm text-ink/70 mb-2">Describe a change below</p>
                  <p className="font-mono text-xs text-muted leading-relaxed">
                    e.g. "Change the heading to Welcome"<br />
                    "Make the background dark blue"<br />
                    "Update name to Arpit"
                  </p>
                </div>
              </div>
            ) : (
              editLog.map((entry, i) => (
                <div
                  key={i}
                  className={`ed-entry p-4 rounded-xl border ${
                    entry.success
                      ? "bg-success/5 border-success/15"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p className="font-sans text-sm text-ink leading-relaxed mb-2">
                    {entry.instruction}
                  </p>
                  <div className={`flex items-center gap-2 font-mono text-[0.65rem] ${
                    entry.success ? "text-success" : "text-red-500"
                  }`}>
                    {entry.success
                      ? <CheckCircle2 size={12} />
                      : <XCircle size={12} />}
                    <span>{entry.success ? "Applied" : "Failed"}</span>
                    <span className="text-muted">·</span>
                    <span className="text-meta">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={logBottomRef} />
          </div>

          {/* ── Instruction input ──────────────────────────────────────────── */}
          <div className="p-4 flex-shrink-0 border-t border-black/5 bg-parchment space-y-3">
            <label className="label-mono text-[0.65rem] text-ink/60 block">
              What should change?
            </label>
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`"Change heading to Hello World"\n"Add a dark background"\n"Replace Arpit with my name"`}
              rows={3}
              disabled={isEditing || isLoading}
              className={`input-editorial w-full resize-none font-sans text-sm leading-relaxed ${(isEditing || isLoading) ? "opacity-50" : ""}`}
            />
            <button
              onClick={handleApplyEdit}
              disabled={!canApply}
              className={`btn-primary w-full text-sm ${!canApply ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isEditing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Applying…
                </>
              ) : (
                <>
                  <Edit3 size={16} />
                  Apply Edit ↵
                </>
              )}
            </button>
            <p className="label-mono text-[0.6rem] text-meta text-center">
              Enter to apply · Shift+Enter for newline
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — Preview ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-cream">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-bronze">
              <Loader2 size={32} className="animate-spin" />
              <span className="label-mono text-sm">Loading file…</span>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-10">
              <XCircle size={40} className="text-red-400" />
              <p className="font-sans text-sm text-red-500 text-center">{error}</p>
              <button
                onClick={loadFile}
                className="btn-secondary text-sm"
              >
                Retry
              </button>
            </div>
          ) : fileType === "html" && activeTab === "preview" ? (
            <iframe
              srcDoc={content}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview"
            />
          ) : (
            <pre className="m-0 p-7 h-full overflow-y-auto text-sm leading-relaxed font-mono text-ink/80 whitespace-pre-wrap break-words bg-white border-l border-black/5 box-border">
              {content}
            </pre>
          )}

          {/* Editing overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Loader2 size={36} className="animate-spin text-bronze" />
              <span className="label-mono text-sm text-bronze">Applying your edit…</span>
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
      <div className="h-screen flex items-center justify-center bg-cream text-muted font-mono text-sm">
        <Loader2 size={24} className="animate-spin text-bronze mr-3" />
        Loading editor…
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
