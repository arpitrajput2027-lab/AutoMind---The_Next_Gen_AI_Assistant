"use client";

import { useState } from "react";

const TECH_STACK = [
  {
    category: "Frontend",
    color: "#00d9ff",
    items: [
      { name: "Next.js 14", icon: "▲", desc: "App Router + Server Components" },
      { name: "TypeScript", icon: "TS", desc: "Type-safe development" },
      { name: "Three.js / VRM", icon: "🎭", desc: "3D anime avatar rendering" },
      { name: "WebSocket", icon: "⚡", desc: "Real-time mobile sync" },
    ],
  },
  {
    category: "Backend",
    color: "#a855f7",
    items: [
      { name: "FastAPI", icon: "🐍", desc: "Async Python REST + WS" },
      { name: "PyAutoGUI", icon: "🖥️", desc: "System-level automation" },
      { name: "WebSockets", icon: "🔌", desc: "Bi-directional communication" },
      { name: "Pydantic", icon: "✅", desc: "Data validation & schemas" },
    ],
  },
  {
    category: "AI / LLM",
    color: "#00ff88",
    items: [
      { name: "Sarvam AI", icon: "🇮🇳", desc: "Primary — Hindi + English" },
      { name: "Claude API", icon: "🤖", desc: "Anthropic — advanced reasoning" },
      { name: "OpenAI GPT", icon: "✨", desc: "GPT-4 fallback / switch" },
      { name: "Whisper STT", icon: "🎤", desc: "Speech recognition" },
    ],
  },
  {
    category: "Automation",
    color: "#ff6b35",
    items: [
      { name: "win32api", icon: "🪟", desc: "Windows system control" },
      { name: "smtplib", icon: "📧", desc: "Email automation" },
      { name: "pywhatkit", icon: "💬", desc: "WhatsApp messaging" },
      { name: "python-docx", icon: "📝", desc: "Word document generation" },
    ],
  },
];

const MODELS = [
  {
    id: "sarvam",
    name: "Sarvam AI",
    flag: "🇮🇳",
    badge: "DEFAULT",
    badgeColor: "#00ff88",
    desc: "Optimized for Indian languages. Best for Hindi + English bilingual commands.",
    latency: "~0.8s",
    langs: "Hindi, English",
  },
  {
    id: "claude",
    name: "Claude 3.5",
    flag: "🤖",
    badge: "POWERFUL",
    badgeColor: "#00d9ff",
    desc: "Anthropic's flagship. Best for complex multi-step reasoning and code generation.",
    latency: "~1.2s",
    langs: "English",
  },
  {
    id: "openai",
    name: "GPT-4o",
    flag: "✨",
    badge: "VERSATILE",
    badgeColor: "#a855f7",
    desc: "OpenAI's best. Excellent general purpose tasks and vision capabilities.",
    latency: "~1.5s",
    langs: "Multilingual",
  },
];

export default function TechStack() {
  const [activeModel, setActiveModel] = useState("sarvam");

  const selectedModel = MODELS.find((m) => m.id === activeModel)!;

  return (
    <section
      id="tech-stack"
      style={{
        padding: "120px 2rem",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(0,217,255,0.02) 50%, transparent 100%)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div className="animate-fade-up" style={{ marginBottom: "1.25rem" }}>
            <span className="section-tag">
              <span>🔧</span>
              Tech Stack
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
            Built With the{" "}
            <span className="text-gradient-cyan">Best Tools</span>
          </h2>
        </div>

        {/* Stack Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "80px",
          }}
        >
          {TECH_STACK.map((stack, si) => (
            <div
              key={stack.category}
              className="card-glow animate-fade-up"
              style={{
                borderRadius: "12px",
                padding: "28px",
                animationDelay: `${si * 0.1}s`,
                opacity: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: `1px solid ${stack.color}20`,
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: stack.color,
                    boxShadow: `0 0 8px ${stack.color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: stack.color,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {stack.category}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {stack.items.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        background: `${stack.color}10`,
                        border: `1px solid ${stack.color}20`,
                        borderRadius: "7px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: stack.color,
                        fontFamily: "var(--font-mono)",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "var(--ink)",
                          marginBottom: "2px",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Model Selector Showcase */}
        <div
          className="animate-fade-up delay-300"
          style={{
            maxWidth: "820px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              Switch AI Models Instantly
            </h3>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              Demo to judges with the best model — switch anytime without restart
            </p>
          </div>

          <div
            className="card-glow"
            style={{ borderRadius: "14px", padding: "32px", opacity: 1 }}
          >
            {/* Model Tabs */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "28px",
                background: "var(--bg-parchment-light)",
                padding: "4px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    // border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    transition: "all 0.25s ease",
                    background:
                      activeModel === model.id
                        ? `${selectedModel.badgeColor}18`
                        : "transparent",
                    color:
                      activeModel === model.id
                        ? selectedModel.badgeColor
                        : "var(--text-secondary)",
                    border:
                      activeModel === model.id
                        ? `1px solid ${selectedModel.badgeColor}30`
                        : "1px solid transparent",
                  }}
                >
                  {model.flag} {model.name}
                </button>
              ))}
            </div>

            {/* Selected Model Detail */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{selectedModel.flag}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        color: "var(--ink)",
                      }}
                    >
                      {selectedModel.name}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: selectedModel.badgeColor,
                        background: `${selectedModel.badgeColor}15`,
                        border: `1px solid ${selectedModel.badgeColor}25`,
                        padding: "2px 8px",
                        borderRadius: "3px",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {selectedModel.badge}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {selectedModel.desc}
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-parchment-light)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {[
                    { label: "Avg Latency", value: selectedModel.latency },
                    { label: "Languages", value: selectedModel.langs },
                    {
                      label: "Status",
                      value: (
                        <span style={{ color: "#00ff88" }}>● Active</span>
                      ),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          color: "var(--ink)",
                          fontWeight: 500,
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
