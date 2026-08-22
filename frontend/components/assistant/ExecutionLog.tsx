"use client";

import { useEffect, useRef } from "react";
import type { ExecutionStep } from "@/hooks/useWebSocket";

interface ExecutionLogProps {
  steps: ExecutionStep[];
  isThinking: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  running: "#00d9ff",
  done:    "#00ff88",
  error:   "#ff4444",
  pending: "var(--text-muted)",
};

const STATUS_ICON: Record<string, string> = {
  running: "⟳",
  done:    "✓",
  error:   "✗",
  pending: "○",
};

export default function ExecutionLog({ steps, isThinking }: ExecutionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "rgba(0,5,10,0.95)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: isThinking ? "#00d9ff" : "#00ff88",
            boxShadow: isThinking ? "0 0 8px #00d9ff" : "0 0 8px #00ff88",
            animation: isThinking ? "glow-pulse 1s ease-in-out infinite" : "none",
          }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.7rem",
            color: "var(--text-secondary)", letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Execution Log
          </span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.65rem",
          color: "var(--text-muted)",
        }}>
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log entries */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "12px 16px",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        {steps.length === 0 && !isThinking && (
          <div style={{
            textAlign: "center", padding: "40px 0",
            fontFamily: "var(--font-mono)", fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}>
            Waiting for commands...
          </div>
        )}

        {isThinking && steps.length === 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px",
            background: "rgba(0,217,255,0.06)",
            border: "1px solid rgba(0,217,255,0.12)",
            borderRadius: "6px",
            animation: "fadeInUp 0.3s ease forwards",
          }}>
            <span style={{
              color: "#00d9ff", fontSize: "0.85rem",
              animation: "spin 1s linear infinite",
              display: "inline-block",
            }}>⟳</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.78rem",
              color: "#00d9ff",
            }}>
              Processing command...
            </span>
          </div>
        )}

        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              padding: "8px 12px",
              background: step.status === "error"
                ? "rgba(255,68,68,0.05)"
                : step.status === "done"
                ? "rgba(0,255,136,0.04)"
                : "rgba(0,217,255,0.06)",
              border: `1px solid ${STATUS_COLOR[step.status]}18`,
              borderLeft: `2px solid ${STATUS_COLOR[step.status]}`,
              borderRadius: "0 6px 6px 0",
              animation: "fadeInUp 0.3s ease forwards",
            }}
          >
            <span style={{
              color: STATUS_COLOR[step.status],
              fontSize: "0.8rem",
              flexShrink: 0,
              marginTop: "1px",
              animation: step.status === "running"
                ? "spin 1s linear infinite"
                : "none",
              display: "inline-block",
            }}>
              {STATUS_ICON[step.status]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.78rem",
                color: STATUS_COLOR[step.status],
                marginBottom: step.detail ? "3px" : 0,
              }}>
                {step.step}
              </div>
              {step.detail && (
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  wordBreak: "break-all",
                }}>
                  {step.detail}
                </div>
              )}
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                color: "var(--text-muted)", marginTop: "3px",
              }}>
                {new Date(step.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
