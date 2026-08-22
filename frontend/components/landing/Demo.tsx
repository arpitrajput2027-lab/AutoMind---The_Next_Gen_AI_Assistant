"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DEMO_COMMANDS = [
  {
    cmd: "open VS Code and write a fibonacci sequence in Python",
    response: "Opening VS Code... Writing fibonacci.py... Done! ✓",
    type: "vscode",
    color: "#00d9ff",
    icon: "💻",
  },
  {
    cmd: "set volume to 40% and brightness to 70%",
    response: "Volume → 40% ✓  |  Brightness → 70% ✓",
    type: "system",
    color: "#ff6b35",
    icon: "⚙️",
  },
  {
    cmd: "send WhatsApp to Rahul: project is done bro",
    response: 'WhatsApp opened → Rahul found → "project is done bro" sent ✓',
    type: "whatsapp",
    color: "#00ff88",
    icon: "💬",
  },
  {
    cmd: "create a PowerPoint presentation on Neural Networks",
    response: "PowerPoint created: neural_networks.pptx (8 slides) ✓",
    type: "powerpoint",
    color: "#a855f7",
    icon: "📊",
  },
  {
    cmd: "email team@company.com — Meeting shifted to 4pm",
    response: "Email drafted → Preview shown → Ready to send ✓",
    type: "email",
    color: "#00d9ff",
    icon: "📧",
  },
];

export default function Demo() {
  const [activeCmdIdx, setActiveCmdIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showResponse, setShowResponse] = useState(false);

  const activeCmd = DEMO_COMMANDS[activeCmdIdx];

  const runDemo = () => {
    setIsRunning(true);
    setShowResponse(false);
    setLogs([]);

    const steps = [
      "→ Receiving command...",
      "→ Parsing intent with LLM...",
      `→ Task identified: ${activeCmd.type}_automation`,
      "→ Initializing automation engine...",
      "→ Executing...",
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step]);
        if (i === steps.length - 1) {
          setTimeout(() => {
            setShowResponse(true);
            setIsRunning(false);
          }, 600);
        }
      }, i * 380);
    });
  };

  return (
    <section
      id="demo"
      style={{
        padding: "120px 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(0,217,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="animate-fade-up" style={{ marginBottom: "1.25rem" }}>
            <span className="section-tag">
              <span>▶</span>
              Interactive Demo
            </span>
          </div>
          <h2
            className="animate-fade-up delay-100"
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Try It{" "}
            <span className="text-gradient-cyan">Right Here</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            Click a command and watch AutoMind execute it step by step
          </p>
        </div>

        {/* Demo Interface */}
        <div
          className="animate-fade-up delay-200 card-glow"
          style={{
            borderRadius: "16px",
            padding: "32px",
            opacity: 0,
          }}
        >
          {/* Command Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {DEMO_COMMANDS.map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveCmdIdx(i);
                  setLogs([]);
                  setShowResponse(false);
                  setIsRunning(false);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: `1px solid ${activeCmdIdx === i ? cmd.color + "60" : "var(--border-subtle)"}`,
                  background:
                    activeCmdIdx === i ? `${cmd.color}12` : "transparent",
                  color: activeCmdIdx === i ? cmd.color : "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{cmd.icon}</span>
                {cmd.type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Command Display */}
          <div
            style={{
              background: "rgba(0,5,10,0.9)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              padding: "20px 24px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                marginBottom: "10px",
                letterSpacing: "0.1em",
              }}
            >
              YOU SAY:
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                color: "#e8f4fd",
                lineHeight: 1.5,
              }}
            >
              "{activeCmd.cmd}"
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runDemo}
            disabled={isRunning}
            style={{
              width: "100%",
              padding: "14px",
              background: isRunning
                ? "rgba(0,217,255,0.1)"
                : "linear-gradient(135deg, var(--cyan), #0099bb)",
              border: isRunning ? "1px solid var(--border-glow)" : "none",
              borderRadius: "8px",
              color: isRunning ? "var(--cyan)" : "var(--bg-void)",
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: isRunning ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isRunning ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                Executing...
              </>
            ) : (
              <>
                ▶ Run This Command
              </>
            )}
          </button>

          {/* Execution Log */}
          {(logs.length > 0 || showResponse) && (
            <div
              className="terminal-box"
              style={{ marginBottom: "0" }}
            >
              <div className="terminal-content">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                      fontSize: "0.8rem",
                      animation: "fadeInUp 0.3s ease forwards",
                    }}
                  >
                    {log}
                  </div>
                ))}
                {showResponse && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: `1px solid ${activeCmd.color}20`,
                      color: activeCmd.color,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      animation: "fadeInUp 0.4s ease forwards",
                    }}
                  >
                    ✓ {activeCmd.response}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Final CTA */}
        <div
          className="animate-fade-up delay-400"
          style={{
            textAlign: "center",
            marginTop: "80px",
            padding: "64px 40px",
            background:
              "linear-gradient(135deg, rgba(0,217,255,0.05), rgba(0,255,136,0.03))",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            opacity: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
            }}
          >
            Ready to Command{" "}
            <span className="text-gradient-cyan">Your PC?</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              marginBottom: "2.5rem",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
            }}
          >
            No setup needed. Just launch and start speaking. AutoMind is ready
            for your first command.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/assistant" className="btn-primary glow-cyan">
              🚀 Start Trying Free
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
