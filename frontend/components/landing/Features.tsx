"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "🗣️",
    title: "Natural Language Control",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Speak or type in plain English (or Hindi). AutoMind understands context and intent — no rigid commands needed.",
    demo: 'automind.do("increase brightness to 80%")',
  },
  {
    icon: "💻",
    title: "VS Code Automation",
    tag: "NEW",
    tagColor: "#00ff88",
    desc: "Say any coding task — web dev, DSA, Python, Java, C++ — AutoMind opens VS Code and writes complete, runnable code.",
    demo: 'automind.do("write a binary search in Python")',
  },
  {
    icon: "⚙️",
    title: "System Control",
    tag: "NEW",
    tagColor: "#00ff88",
    desc: "Control brightness, volume, shutdown, restart and more through voice or text commands. Full OS-level automation.",
    demo: 'automind.do("set volume 60, shutdown in 1hr")',
  },
  {
    icon: "📧",
    title: "Email Automation",
    tag: "ENHANCED",
    tagColor: "#a855f7",
    desc: "Draft emails with structured formatting, preview before sending, edit inline, then dispatch — all in one flow.",
    demo: 'automind.do("email team: meeting at 3pm")',
  },
  {
    icon: "💬",
    title: "WhatsApp Messaging",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Send WhatsApp messages through simple commands. AutoMind opens, finds the contact, types and sends automatically.",
    demo: 'automind.do("msg Priya: I\'ll be late")',
  },
  {
    icon: "📊",
    title: "MS PowerPoint",
    tag: "NEW",
    tagColor: "#00ff88",
    desc: "Generate full presentations from a topic description. AutoMind builds slides with structure, headings, and content.",
    demo: 'automind.do("make PPT on Climate Change")',
  },
  {
    icon: "📝",
    title: "Notepad / MS Word",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Create documents, write notes, or save code snippets directly into Notepad or Word with formatted output.",
    demo: 'automind.do("write meeting notes to Word")',
  },
  {
    icon: "🎬",
    title: "YouTube Search",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Search and open YouTube videos instantly through voice. No mouse, no keyboard — just tell AutoMind what to play.",
    demo: 'automind.do("play lo-fi hip hop on YT")',
  },
  {
    icon: "🎤",
    title: "Voice Interaction",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Fully hands-free mode. Speak your command, hear the result. STT + TTS with real-time feedback and response.",
    demo: 'automind.listen() // always ready',
  },
  {
    icon: "🌐",
    title: "Real-Time Queries",
    tag: "CORE",
    tagColor: "#00d9ff",
    desc: "Ask anything — weather, news, calculations, facts. AutoMind fetches live data and responds instantly with context.",
    demo: 'automind.do("what\'s the weather in Delhi?")',
  },
  {
    icon: "📱",
    title: "Mobile PWA Control",
    tag: "NEW",
    tagColor: "#00ff88",
    desc: "Control your PC from your phone via WebSocket. Full mobile-responsive UI — command desktop automation remotely.",
    demo: 'ws://localhost:8000/ws/mobile',
  },
  {
    icon: "🤖",
    title: "Multi-Model AI",
    tag: "NEW",
    tagColor: "#00ff88",
    desc: "Switch between Sarvam AI, Claude, and OpenAI on the fly. Pick the best model for your task or demo audience.",
    demo: 'setModel("claude" | "sarvam" | "openai")',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-glow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "10px",
        padding: "28px",
        cursor: "default",
        animation: `fadeInUp 0.6s ease forwards`,
        animationDelay: `${index * 0.07}s`,
        opacity: 0,
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: hovered ? "rgba(0,217,255,0.12)" : "rgba(0,217,255,0.06)",
            border: "1px solid rgba(0,217,255,0.15)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            transition: "all 0.3s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {feature.icon}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: feature.tagColor,
            background: `${feature.tagColor}14`,
            border: `1px solid ${feature.tagColor}30`,
            padding: "3px 8px",
            borderRadius: "3px",
          }}
        >
          {feature.tag}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 700,
          fontSize: "1.05rem",
        //   color: "#e8f4fd",
          marginBottom: "10px",
          lineHeight: 1.3,
          transition: "color 0.2s ease",
          color: hovered ? "#00d9ff" : "#e8f4fd",
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          marginBottom: "18px",
        }}
      >
        {feature.desc}
      </p>

      {/* Code Demo */}
      <div
        style={{
          background: "rgba(0,5,10,0.8)",
          border: "1px solid rgba(0,217,255,0.08)",
          borderRadius: "5px",
          padding: "10px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "#00ff88",
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 0.3s ease",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {feature.demo}
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "120px 2rem",
        maxWidth: "1280px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "1.25rem" }}>
          <span className="section-tag">
            <span>⚡</span>
            Capabilities
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
          Everything AutoMind
          <br />
          <span className="text-gradient-cyan">Can Do For You</span>
        </h2>
        <p
          className="animate-fade-up delay-200"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          12 powerful automation modules, all controlled through a single
          natural language interface.
        </p>
      </div>

      {/* Feature Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
