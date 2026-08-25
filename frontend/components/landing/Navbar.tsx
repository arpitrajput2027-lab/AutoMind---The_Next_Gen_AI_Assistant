"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.4s ease",
        background: scrolled
          ? "rgba(250, 248, 244, 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #00d9ff, #00ff88)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(0,217,255,0.35)",
                fontSize: "18px",
                fontWeight: "800",
                color: "#03070d",
                fontFamily: "var(--font-syne)",
              }}
            >
              A
            </div>
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: "800",
                fontSize: "1.25rem",
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Auto<span style={{ color: "var(--bronze)" }}>Mind</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
          }}
          className="hidden-mobile"
        >
          {["Features", "How It Works", "Tech Stack", "Demo"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                fontWeight: "500",
                color: "var(--text-secondary)",
                textDecoration: "none",
                letterSpacing: "0.08em",
                transition: "color 0.2s ease",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "var(--cyan)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  "var(--text-secondary)")
              }
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: "20px",
              padding: "4px 12px",
            }}
            className="hidden-mobile"
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px #00ff88",
                animation: "glow-pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "#00ff88",
                letterSpacing: "0.1em",
              }}
            >
              LIVE
            </span>
          </div>

          <Link href="/assistant" className="btn-primary" style={{ padding: "10px 22px", fontSize: "0.85rem" }}>
            Launch App
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--cyan)",
            cursor: "pointer",
            padding: "8px",
          }}
          className="show-mobile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "var(--bg-parchment-light)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "1.5rem 2rem",
          }}
        >
          {["Features", "How It Works", "Tech Stack", "Demo"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "1px solid var(--border-subtle)",
                letterSpacing: "0.08em",
              }}
            >
              {item}
            </a>
          ))}
          <Link
            href="/assistant"
            style={{
              display: "inline-block",
              marginTop: "1rem",
            }}
            className="btn-primary"
          >
            Launch App
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
