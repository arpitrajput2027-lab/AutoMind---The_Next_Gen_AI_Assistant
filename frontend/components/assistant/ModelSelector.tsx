"use client";

import { Sparkles, Cpu } from "lucide-react";

const MODELS = [
  { id: "gemini", name: "Gemini", icon: <Sparkles size={14} /> },
  { id: "grok", name: "Grok", icon: <Cpu size={14} /> },
];

interface ModelSelectorProps {
  selected: string;
  onChange: (model: string) => void;
}

export default function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label-mono px-2 opacity-70">
        AI Brain
      </span>
      <div className="flex flex-col gap-1">
      {MODELS.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          title={m.name}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-colors border ${
            selected === m.id
              ? "bg-bronze/10 text-bronze border-bronze/30"
              : "bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-cream"
          }`}
        >
          {m.icon}
          <span>{m.name}</span>
        </button>
      ))}
      </div>
    </div>
  );
}
