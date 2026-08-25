"use client";

import { useEffect, useRef } from "react";
import type { ExecutionStep } from "@/hooks/useWebSocket";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

interface ExecutionLogProps {
  steps: ExecutionStep[];
  isThinking: boolean;
}

export default function ExecutionLog({ steps, isThinking }: ExecutionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  return (
    <div className="h-full flex flex-col bg-white border border-black/10 rounded-xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between bg-cream flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-bronze animate-pulse' : 'bg-success'}`} />
          <span className="label-mono text-ink">Execution Log</span>
        </div>
        <span className="label-mono text-meta">
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {steps.length === 0 && !isThinking && (
          <div className="text-center py-10 label-mono text-muted">
            Waiting for commands...
          </div>
        )}

        {isThinking && steps.length === 0 && (
          <div className="flex items-center gap-3 p-3 bg-bronze/5 border border-bronze/10 rounded-lg animate-fade-up text-bronze">
            <Loader2 size={16} className="animate-spin flex-shrink-0" />
            <span className="font-mono text-xs">Processing command...</span>
          </div>
        )}

        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex gap-3 items-start p-3 border-l-2 rounded-r-lg animate-fade-up ${
                step.status === 'error' ? 'bg-red-50/50 border-red-400' :
                step.status === 'done' ? 'bg-success/5 border-success' :
                'bg-bronze/5 border-bronze'
            }`}
          >
            <span className={`mt-0.5 flex-shrink-0 ${
                step.status === 'error' ? 'text-red-500' :
                step.status === 'done' ? 'text-success' :
                'text-bronze'
            }`}>
              {step.status === 'running' ? <Loader2 size={14} className="animate-spin" /> :
               step.status === 'done' ? <CheckCircle2 size={14} /> :
               step.status === 'error' ? <XCircle size={14} /> :
               <Circle size={14} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`font-mono text-xs ${
                step.status === 'error' ? 'text-red-700' :
                step.status === 'done' ? 'text-success' :
                'text-bronze'
              } ${step.detail ? 'mb-1' : ''}`}>
                {step.step}
              </div>
              {step.detail && (
                <div className="font-mono text-[10px] text-muted break-all">
                  {step.detail}
                </div>
              )}
              <div className="font-mono text-[9px] text-meta mt-1">
                {new Date(step.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
