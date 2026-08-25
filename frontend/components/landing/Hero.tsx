"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TYPEWRITER_PHRASES = [
  "open VS Code and write a sorting algorithm",
  "send a WhatsApp message to Rahul",
  "create a PowerPoint about machine learning",
  "set volume to 60% and dim the screen",
  "draft an email to my team about standup",
  "search YouTube for Next.js tutorials",
  "write a Python web scraper in VS Code",
  "shutdown the computer in 30 minutes",
];

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = TYPEWRITER_PHRASES[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 45);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 22);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPEWRITER_PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 2rem 80px",
        overflow: "hidden",
      }}
    >
      {/* Animated Grid Background */}
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      {/* Radial Glow Center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(139,106,62,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "30%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(95,115,80,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating Orbit Rings */}
      <OrbitalRings />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "900px" }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{ marginBottom: "2rem" }}>
          <span className="section-tag">
            <span style={{ fontSize: "0.6rem" }}>●</span>
            Next Generation AI Assistant · v2.0
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ color: "var(--ink)" }}>Your PC.</span>
          <br />
          <span className="text-gradient-cyan">Your Command.</span>
        </h1>

        {/* Sub Headline */}
        <p
          className="animate-fade-up delay-200"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "var(--text-secondary)",
            marginBottom: "2.5rem",
            maxWidth: "620px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.65,
          }}
        >
          AutoMind understands natural language and actually{" "}
          <em style={{ color: "var(--cyan)", fontStyle: "normal", fontWeight: 600 }}>
            executes
          </em>{" "}
          the task — no manual steps, no friction.
        </p>

        {/* Typewriter Terminal */}
        <div
          className="animate-fade-up delay-300"
          style={{
            display: "inline-block",
            marginBottom: "3rem",
            maxWidth: "700px",
            width: "100%",
          }}
        >
          <div
            style={{
              background: "rgba(0,5,10,0.95)",
              border: "1px solid rgba(0,217,255,0.18)",
              borderTop: "2px solid var(--cyan)",
              borderRadius: "8px",
              padding: "20px 24px",
              textAlign: "left",
              boxShadow: "0 24px 80px rgba(0,217,255,0.1)",
            }}
          >
            <div style={{ marginBottom: "14px", display: "flex", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: "0.9rem", opacity: 0.7, flexShrink: 0 }}>
                you →
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  color: "#e8f4fd",
                  minHeight: "1.4em",
                }}
              >
                {displayed}
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1em",
                    background: "var(--cyan)",
                    marginLeft: "2px",
                    verticalAlign: "middle",
                    animation: "blink-cursor 1s step-end infinite",
                  }}
                />
              </span>
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", opacity: 0.7, flexShrink: 0 }}>
                automind →
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--green)",
                  opacity: 0.8,
                }}
              >
                Executing task...
                <span style={{ color: "#00ff88", marginLeft: "8px" }}>✓ Done</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up delay-400"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "4rem",
          }}
        >
          <Link href="/assistant" className="btn-primary glow-cyan">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            Start Trying Free
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            Watch Demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </a>
        </div>

        {/* Stats Row */}
        <div
          className="animate-fade-up delay-500"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1px",
            maxWidth: "600px",
            margin: "0 auto",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "var(--border-subtle)",
          }}
        >
          {[
            { value: "10+", label: "Automations" },
            { value: "3", label: "AI Models" },
            { value: "0ms", label: "Click Needed" },
            { value: "∞", label: "Commands" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--bg-parchment-light)",
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  color: "var(--cyan)",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="animate-fade-up delay-700"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Scroll to explore
        </span>
        <div
          style={{
            width: "24px",
            height: "40px",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            paddingTop: "6px",
          }}
        >
          <div
            style={{
              width: "3px",
              height: "8px",
              background: "var(--cyan)",
              borderRadius: "2px",
              animation: "float 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function OrbitalRings() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          border: "1px solid rgba(0,217,255,0.06)",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Middle ring */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          border: "1px solid rgba(0,255,136,0.06)",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Orbiting dot 1 */}
      <div
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          background: "var(--cyan)",
          borderRadius: "50%",
          boxShadow: "0 0 16px var(--cyan)",
          top: "50%",
          left: "50%",
          transformOrigin: "0 0",
          animation: "orbit 8s linear infinite",
          marginTop: "-4px",
          marginLeft: "-4px",
        }}
      />
      {/* Orbiting dot 2 */}
      <div
        style={{
          position: "absolute",
          width: "5px",
          height: "5px",
          background: "var(--green)",
          borderRadius: "50%",
          boxShadow: "0 0 12px var(--green)",
          top: "50%",
          left: "50%",
          transformOrigin: "0 0",
          animation: "orbit 12s linear infinite reverse",
          marginTop: "-2.5px",
          marginLeft: "-2.5px",
        }}
      />
    </div>
  );
}
