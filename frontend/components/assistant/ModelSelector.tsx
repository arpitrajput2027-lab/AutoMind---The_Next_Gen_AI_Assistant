"use client";

const MODELS = [
  { id: "sarvam", name: "Sarvam AI", flag: "🇮🇳", color: "#00ff88" },
  { id: "claude", name: "Claude",    flag: "🤖", color: "#00d9ff" },
  { id: "openai", name: "GPT-4o",   flag: "✨", color: "#a855f7" },
];

interface ModelSelectorProps {
  selected: string;
  onChange: (model: string) => void;
}

export default function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  const active = MODELS.find((m) => m.id === selected) || MODELS[0];

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "0.65rem",
        color: "var(--text-muted)", letterSpacing: "0.1em",
        textTransform: "uppercase", marginRight: "4px",
      }}>
        Model
      </span>
      {MODELS.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          title={m.name}
          style={{
            padding: "5px 12px",
            borderRadius: "4px",
            border: selected === m.id
              ? `1px solid ${m.color}60`
              : "1px solid rgba(255,255,255,0.06)",
            background: selected === m.id ? `${m.color}14` : "transparent",
            color: selected === m.id ? m.color : "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", gap: "5px",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>{m.flag}</span>
          <span>{m.name}</span>
        </button>
      ))}
    </div>
  );
}
