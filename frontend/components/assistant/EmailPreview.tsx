"use client";

import { useState, useEffect, useRef } from "react";
import type { EmailPreview } from "@/hooks/useWebSocket";

interface EmailPreviewModalProps {
  preview: EmailPreview;
  onConfirm: (preview: EmailPreview) => void;
  onCancel: () => void;
}

export default function EmailPreviewModal({
  preview,
  onConfirm,
  onCancel,
}: EmailPreviewModalProps) {
  const [edited, setEdited] = useState<EmailPreview>({ ...preview });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Animate in + auto-focus
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      firstInputRef.current?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCancel = () => {
    setVisible(false);
    setTimeout(onCancel, 250);
  };

  const handleSend = () => {
    if (sending || sent) return;
    setSending(true);
    setTimeout(() => {
      setSent(true);
      onConfirm(edited);
    }, 800);
  };

  const charCount = edited.body.length;

  return (
    <>
      {/* ── Global style injection ── */}
      <style>{`
        @keyframes ep-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ep-modal-in {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes ep-modal-out {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(16px) scale(0.97); }
        }
        @keyframes ep-sent-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .ep-field:focus {
          border-color: rgba(0,217,255,0.55) !important;
          box-shadow: 0 0 0 3px rgba(0,217,255,0.1);
          outline: none;
        }
        .ep-btn-cancel:hover {
          background: rgba(0,217,255,0.06) !important;
          border-color: rgba(0,217,255,0.3) !important;
          color: #e8f4fd !important;
        }
        .ep-btn-send:hover:not(:disabled) {
          filter: brightness(1.15);
          box-shadow: 0 0 22px rgba(0,217,255,0.4);
          transform: translateY(-1px);
        }
        .ep-btn-send:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        onClick={handleCancel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(3,7,13,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "ep-backdrop-in 0.25s ease forwards",
        }}
      />

      {/* ── Modal ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "580px",
            background: "linear-gradient(160deg, #07111f 0%, #040c18 100%)",
            border: "1px solid rgba(0,217,255,0.22)",
            borderRadius: "16px",
            boxShadow:
              "0 0 0 1px rgba(0,217,255,0.06), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,217,255,0.06)",
            overflow: "hidden",
            pointerEvents: "all",
            animation: visible
              ? "ep-modal-in 0.28s cubic-bezier(0.22,1,0.36,1) forwards"
              : "ep-modal-out 0.22s ease forwards",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              padding: "18px 22px 16px",
              borderBottom: "1px solid rgba(0,217,255,0.09)",
              background: "rgba(0,217,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Icon */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "rgba(0,217,255,0.1)",
                  border: "1px solid rgba(0,217,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                ✉️
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#e8f4fd",
                    letterSpacing: "0.01em",
                  }}
                >
                  Email Preview
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.62rem",
                    color: "rgba(0,217,255,0.55)",
                    letterSpacing: "0.08em",
                    marginTop: "2px",
                  }}
                >
                  REVIEW BEFORE SENDING
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleCancel}
              style={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#7fa8c9",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "#7fa8c9";
              }}
            >
              ✕
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* From (read-only) */}
            <FieldRow label="From">
              <div
                style={{
                  padding: "9px 13px",
                  background: "rgba(0,217,255,0.03)",
                  border: "1px solid rgba(0,217,255,0.08)",
                  borderRadius: "8px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.82rem",
                  color: "#7fa8c9",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>●</span>
                {edited.from || "—"}
              </div>
            </FieldRow>

            {/* To */}
            <FieldRow label="To">
              <input
                ref={firstInputRef}
                className="ep-field"
                value={edited.to}
                onChange={(e) => setEdited({ ...edited, to: e.target.value })}
                placeholder="recipient@email.com"
                style={fieldStyle}
              />
            </FieldRow>

            {/* Subject */}
            <FieldRow label="Subject">
              <input
                className="ep-field"
                value={edited.subject}
                onChange={(e) => setEdited({ ...edited, subject: e.target.value })}
                placeholder="Email subject..."
                style={fieldStyle}
              />
            </FieldRow>

            {/* Body */}
            <FieldRow label="Body">
              <div style={{ position: "relative" }}>
                <textarea
                  className="ep-field"
                  value={edited.body}
                  onChange={(e) => setEdited({ ...edited, body: e.target.value })}
                  rows={7}
                  placeholder="Email body..."
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                    lineHeight: 1.65,
                    minHeight: "140px",
                    paddingBottom: "28px",
                  }}
                />
                {/* char counter */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "10px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "0.6rem",
                    color: charCount > 1800 ? "#ff6b35" : "rgba(0,217,255,0.3)",
                    pointerEvents: "none",
                  }}
                >
                  {charCount} chars
                </span>
              </div>
            </FieldRow>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid rgba(0,217,255,0.09)",
              background: "rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* Hint */}
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.6rem",
                color: "rgba(0,217,255,0.3)",
                letterSpacing: "0.05em",
              }}
            >
              ESC to cancel
            </span>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* Cancel */}
              <button
                className="ep-btn-cancel"
                onClick={handleCancel}
                style={{
                  padding: "9px 22px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,217,255,0.15)",
                  background: "transparent",
                  color: "#7fa8c9",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.02em",
                }}
              >
                Discard
              </button>

              {/* Send */}
              <button
                className="ep-btn-send"
                onClick={handleSend}
                disabled={sending || sent}
                style={{
                  padding: "9px 26px",
                  borderRadius: "8px",
                  background: sent
                    ? "linear-gradient(135deg, #00ff88, #00cc6a)"
                    : "linear-gradient(135deg, #00d9ff, #0099cc)",
                  border: "none",
                  color: "#03070d",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: sending || sent ? "default" : "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.03em",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  opacity: sending ? 0.8 : 1,
                }}
              >
                {sent ? (
                  <>
                    <span style={{ animation: "ep-sent-pop 0.4s ease forwards" }}>✓</span>
                    Sent!
                  </>
                ) : sending ? (
                  <>
                    <SpinnerIcon />
                    Sending…
                  </>
                ) : (
                  <>
                    <SendIcon />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.63rem",
          color: "rgba(0,217,255,0.5)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ── Shared field style ─────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  background: "rgba(0,5,15,0.6)",
  border: "1px solid rgba(0,217,255,0.12)",
  borderRadius: "8px",
  color: "#e8f4fd",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "0.82rem",
  transition: "border-color 0.2s, box-shadow 0.2s",
};
