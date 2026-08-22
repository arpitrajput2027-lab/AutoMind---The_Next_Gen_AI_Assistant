"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 2rem 40px",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "48px",
          marginBottom: "48px",
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #00d9ff, #00ff88)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                color: "#e8f4fd",
              }}
            >
              Auto<span style={{ color: "#00d9ff" }}>Mind</span>
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: "280px",
            }}
          >
            The next generation AI assistant that doesn't just respond — it
            acts. Control your entire PC through natural language.
          </p>
        </div>

        {/* Links */}
        {[
          {
            title: "Product",
            links: ["Features", "How It Works", "Tech Stack", "Demo"],
          },
          {
            title: "Resources",
            links: ["Documentation", "API Reference", "GitHub", "Changelog"],
          },
          {
            title: "Connect",
            links: ["Twitter", "LinkedIn", "Discord", "Email"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              {col.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLAnchorElement).style.color = "var(--cyan)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLAnchorElement).style.color =
                      "var(--text-secondary)")
                  }
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          © 2024 AutoMind. Built with{" "}
          <span style={{ color: "#ff6b35" }}>♥</span> for automation.
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
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
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          footer > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </footer>
  );
}
