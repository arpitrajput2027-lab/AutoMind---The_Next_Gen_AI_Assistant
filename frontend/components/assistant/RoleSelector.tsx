"use client";

import { useState } from "react";
import { Sparkles, Plus, Check, X } from "lucide-react";

export interface RoleInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  is_custom?: boolean;
}

const FALLBACK_ROLES: RoleInfo[] = [
  { id: "default", name: "VENOM", emoji: "⚡", description: "Default autonomous desktop agent", color: "#8b6a3e" },
  { id: "developer", name: "Developer", emoji: "💻", description: "Senior engineer — code, debug, architecture", color: "#0d7377" },
  { id: "teacher", name: "Teacher", emoji: "📚", description: "Patient educator — explains step by step", color: "#2d6a4f" },
  { id: "writer", name: "Creative Writer", emoji: "✍️", description: "Storyteller — prose, scripts, copy", color: "#c2410c" },
  { id: "analyst", name: "Data Analyst", emoji: "📊", description: "Data-driven insights & structured analysis", color: "#6d28d9" },
  { id: "coach", name: "Career Coach", emoji: "🎯", description: "Interview prep, resumes, career advice", color: "#b45309" },
  { id: "researcher", name: "Researcher", emoji: "🔬", description: "Deep research with sources & citations", color: "#1d4ed8" },
  { id: "hacker", name: "Hackathon Coach", emoji: "🏆", description: "Pitch, demo, MVP — built for hackathons", color: "#be123c" },
];

interface RoleSelectorProps {
  roles?: RoleInfo[];
  activeRole: RoleInfo | null;
  onSelect: (roleId: string) => void;
  onCustomRole: (name: string, prompt?: string) => void;
}

export default function RoleSelector({
  roles,
  activeRole,
  onSelect,
  onCustomRole,
}: RoleSelectorProps) {
  const list = roles && roles.length > 0 ? roles : FALLBACK_ROLES;
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const activeId = activeRole?.id ?? "default";

  const submitCustom = () => {
    const name = customName.trim();
    if (!name) return;
    onCustomRole(name, customPrompt.trim() || undefined);
    setShowCustom(false);
    setCustomName("");
    setCustomPrompt("");
  };

  return (
    <div className="h-full flex flex-col bg-white border border-black/10 rounded-xl shadow-soft overflow-hidden">
      <div className="px-4 py-4 border-b border-black/5 bg-parchment-light/60">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-bronze" />
          <h2 className="font-serif font-bold text-ink text-lg tracking-tight">Roles</h2>
        </div>
        <p className="mt-1 font-sans text-xs text-muted leading-relaxed">
          Pick a persona — AI adapts tone & behaviour
        </p>
      </div>

      {/* Active badge */}
      {activeRole && (
        <div
          className="mx-3 mt-3 px-3 py-2.5 rounded-lg border flex items-center gap-2.5 animate-fade-up"
          style={{
            borderColor: `${activeRole.color}55`,
            background: `${activeRole.color}12`,
          }}
        >
          <span className="text-lg leading-none">{activeRole.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="font-sans text-sm font-semibold text-ink truncate">
              {activeRole.name}
            </div>
            <div className="label-mono text-[0.6rem] opacity-70 truncate">
              Active persona
            </div>
          </div>
          <Check size={14} style={{ color: activeRole.color }} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {list.map((role) => {
          const selected = activeId === role.id && !activeRole?.is_custom;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all group ${
                selected
                  ? "border-bronze/40 bg-bronze/10 shadow-sm"
                  : "border-transparent hover:border-black/10 hover:bg-cream"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${role.color}18` }}
                >
                  {role.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-sm font-medium text-ink">
                      {role.name}
                    </span>
                    {selected && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: role.color }}
                      />
                    )}
                  </div>
                  <p className="font-sans text-[0.7rem] text-muted leading-snug mt-0.5 line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        {/* Custom role (active) shown in list */}
        {activeRole?.is_custom && (
          <div
            className="w-full text-left px-3 py-2.5 rounded-lg border border-purple-300/50 bg-purple-50/80"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-md flex items-center justify-center text-base bg-purple-100">
                🎭
              </span>
              <div className="min-w-0">
                <span className="font-sans text-sm font-medium text-ink">
                  {activeRole.name}
                </span>
                <p className="font-sans text-[0.7rem] text-muted mt-0.5">Custom role</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom role creator */}
      <div className="p-3 border-t border-black/5 bg-cream/40">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-bronze/40 text-bronze hover:bg-bronze/5 transition-colors font-sans text-sm font-medium"
          >
            <Plus size={16} />
            Custom Role
          </button>
        ) : (
          <div className="space-y-2 animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="label-mono text-[0.65rem] text-bronze">New persona</span>
              <button
                onClick={() => setShowCustom(false)}
                className="p-1 rounded hover:bg-black/5 text-muted"
              >
                <X size={14} />
              </button>
            </div>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Role name (e.g. Startup Lawyer)"
              className="w-full input-editorial text-sm py-2 px-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitCustom();
                }
              }}
            />
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Optional: describe how they should behave…"
              rows={2}
              className="w-full input-editorial text-sm py-2 px-3 resize-none"
            />
            <button
              onClick={submitCustom}
              disabled={!customName.trim()}
              className={`w-full py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                customName.trim()
                  ? "bg-ink text-cream hover:bg-bronze"
                  : "bg-parchment text-muted cursor-not-allowed"
              }`}
            >
              Activate Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
