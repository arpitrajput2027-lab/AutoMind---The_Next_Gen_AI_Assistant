"use client";

import { useState, useEffect, useRef } from "react";
import type { EmailPreview } from "@/hooks/useWebSocket";
import { Mail, X, Check, Loader2, Send } from "lucide-react";

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

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      firstInputRef.current?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, []);

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
      <div
        onClick={handleCancel}
        className={`fixed inset-0 z-[9998] bg-ink/40 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={`w-full max-w-lg bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all duration-300 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        >
          {/* ── Header ── */}
          <div className="px-6 py-5 border-b border-black/5 bg-cream flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bronze/10 border border-bronze/20 text-bronze flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <h2 className="heading-editorial text-lg text-ink m-0 leading-tight">Email Preview</h2>
                <div className="label-mono text-[0.65rem] text-bronze mt-1">
                  REVIEW BEFORE SENDING
                </div>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-6 flex flex-col gap-5">
            <FieldRow label="From">
              <div className="px-4 py-2.5 bg-cream border border-black/5 rounded-lg font-mono text-sm text-ink/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-bronze/50" />
                {edited.from || "—"}
              </div>
            </FieldRow>

            <FieldRow label="To">
              <input
                ref={firstInputRef}
                className="input-editorial w-full font-mono text-sm"
                value={edited.to}
                onChange={(e) => setEdited({ ...edited, to: e.target.value })}
                placeholder="recipient@email.com"
              />
            </FieldRow>

            <FieldRow label="Subject">
              <input
                className="input-editorial w-full font-sans text-sm"
                value={edited.subject}
                onChange={(e) => setEdited({ ...edited, subject: e.target.value })}
                placeholder="Email subject..."
              />
            </FieldRow>

            <FieldRow label="Body">
              <div className="relative">
                <textarea
                  className="input-editorial w-full font-sans text-sm min-h-[160px] pb-8 resize-y"
                  value={edited.body}
                  onChange={(e) => setEdited({ ...edited, body: e.target.value })}
                  rows={7}
                  placeholder="Email body..."
                />
                <span className={`absolute bottom-3 right-3 font-mono text-[0.65rem] ${charCount > 1800 ? 'text-red-500' : 'text-meta'}`}>
                  {charCount} chars
                </span>
              </div>
            </FieldRow>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-black/5 bg-cream flex items-center justify-between">
            <span className="label-mono text-meta">ESC to cancel</span>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Discard
              </button>

              <button
                onClick={handleSend}
                disabled={sending || sent}
                className={`btn-primary min-w-[120px] ${sent ? 'bg-success border-success text-white' : ''}`}
              >
                {sent ? (
                  <>
                    <Check size={16} className="animate-fade-up" />
                    Sent!
                  </>
                ) : sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} />
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

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-mono block mb-2 text-ink/60">
        {label}
      </label>
      {children}
    </div>
  );
}
