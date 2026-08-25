"use client";

import { useState } from "react";

const STEPS = [
  {
    num: "01",
    icon: "🎤",
    title: "You Give a Command",
    desc: "Speak or type anything in natural language — even Hindi. No rigid syntax. Just say what you want.",
    example: '"Open VS Code and write a bubble sort in Python"',
    color: "#00d9ff",
  },
  {
    num: "02",
    icon: "🧠",
    title: "AutoMind Understands",
    desc: "The LLM (Sarvam / Claude / OpenAI) parses intent, identifies the task type, and plans the execution sequence.",
    example: "Intent: vscode_automation → language: python → task: sort_algorithm",
    color: "#a855f7",
  },
  {
    num: "03",
    icon: "⚙️",
    title: "Task Gets Executed",
    desc: "PyAutoGUI takes over — opens applications, types code, clicks buttons, sends messages. Fully automated.",
    example: "✓ VS Code opened  ✓ File created  ✓ Code written  ✓ Saved",
    color: "#00ff88",
  },
  {
    num: "04",
    icon: "💬",
    title: "Avatar Responds",
    desc: "The 3D anime avatar lip-syncs a TTS response confirming the action, adding personality to every interaction.",
    example: '"Done! Your bubble sort is ready in main.py 🎉"',
    color: "#ff6b35",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section
      id="how-it-works"
      style={{
        padding: "120px 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-200px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(ellipse, rgba(168,85,247,0.05) 0%, transparent 65%)",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div className="animate-fade-up" style={{ marginBottom: "1.25rem" }}>
            <span className="section-tag">
              <span>🔄</span>
              Workflow
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
              marginBottom: "1.25rem",
            }}
          >
            How It{" "}
            <span className="text-gradient-cyan">Actually Works</span>
          </h2>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            From your voice to your screen — the entire pipeline in 4 steps.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            position: "relative",
          }}
        >
          {/* Connecting line (desktop) */}
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: "calc(12.5% + 24px)",
              right: "calc(12.5% + 24px)",
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(0,217,255,0.3), rgba(168,85,247,0.3), rgba(0,255,136,0.3), rgba(255,107,53,0.3))",
              pointerEvents: "none",
              zIndex: 0,
            }}
            className="step-connector"
          />

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="animate-fade-up card-glow"
              style={{
                borderRadius: "12px",
                padding: "32px 24px",
                animationDelay: `${i * 0.15}s`,
                opacity: 0,
                position: "relative",
                zIndex: 1,
                cursor: "pointer",
                borderColor:
                  activeStep === i ? step.color + "50" : undefined,
              }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Step Number + Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background:
                      activeStep === i
                        ? `${step.color}20`
                        : "rgba(26, 24, 20, 0.04)",
                    border: `2px solid ${step.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    transition: "all 0.3s ease",
                    boxShadow:
                      activeStep === i ? `0 0 20px ${step.color}30` : "none",
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: step.color,
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    opacity: 0.7,
                  }}
                >
                  STEP {step.num}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: activeStep === i ? step.color : "var(--ink)",
                  marginBottom: "12px",
                  transition: "color 0.2s ease",
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  marginBottom: "18px",
                }}
              >
                {step.desc}
              </p>

              <div
                style={{
                  background: "rgba(0,5,10,0.8)",
                  border: `1px solid ${step.color}20`,
                  borderLeft: `2px solid ${step.color}60`,
                  borderRadius: "4px",
                  padding: "10px 14px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: step.color,
                  lineHeight: 1.5,
                  opacity: activeStep === i ? 1 : 0.5,
                  transition: "opacity 0.3s ease",
                }}
              >
                {step.example}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <div
          className="animate-fade-up delay-500"
          style={{ marginTop: "80px" }}
        >
          <div
            className="terminal-box"
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              boxShadow: "0 32px 80px rgba(0,217,255,0.08)",
            }}
          >
            <div className="terminal-content">
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  lineHeight: 1.9,
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "#7fa8c9" }}># AutoMind Architecture</span>
                <br />
                <br />
                <span style={{ color: "#00d9ff" }}>User Input</span>
                <span style={{ color: "#7fa8c9" }}> (Voice/Text) </span>
                <span style={{ color: "#e8f4fd" }}>→</span>
                <span style={{ color: "#a855f7" }}> FastAPI </span>
                <span style={{ color: "#e8f4fd" }}>→</span>
                <span style={{ color: "#00ff88" }}> LLM (Intent Parser)</span>
                <br />
                <span style={{ color: "transparent" }}>000000000000000000000</span>
                <span style={{ color: "#e8f4fd" }}>↓</span>
                <br />
                <span style={{ color: "#ff6b35" }}>Automation Engine</span>
                <span style={{ color: "#7fa8c9" }}> ← PyAutoGUI + OS APIs</span>
                <br />
                <span style={{ color: "transparent" }}>000000000000000000000</span>
                <span style={{ color: "#e8f4fd" }}>↓</span>
                <br />
                <span style={{ color: "#00ff88" }}>TTS Response</span>
                <span style={{ color: "#e8f4fd" }}> + </span>
                <span style={{ color: "#a855f7" }}>3D Avatar Lipsync</span>
                <span style={{ color: "#e8f4fd" }}> + </span>
                <span style={{ color: "#00d9ff" }}>Execution Log</span>
                <br />
                <br />
                <span style={{ color: "#3d6380" }}>
                  # Mobile: WebSocket ↔ FastAPI ↔ Same Engine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
