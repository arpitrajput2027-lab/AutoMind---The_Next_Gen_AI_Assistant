"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import VoiceButton from "./VoiceButton";
import { Send, FileText, Globe, Code, File as FileIcon, Mic, Loader2, Volume2, VolumeX, Bot, Mail, X } from "lucide-react";

export interface FileCard {
  path: string;
  name: string;
  file_type: "html" | "code" | "text" | "docx";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  taskType?: string;
  timestamp: number;
  success?: boolean;
  fileCard?: FileCard;
}

const QUICK_COMMANDS = [
  { label: "Write Python code", icon: <Code size={18} /> },
  { label: "Draft an email", icon: <MailIcon size={18} /> },
  { label: "Send a WhatsApp message", icon: <MessageIcon size={18} /> },
  { label: "Create a PowerPoint", icon: <FileText size={18} /> },
];

function MailIcon({size}: {size: number}) { return <Mail size={size} />; }
function MessageIcon({size}: {size: number}) { return <span style={{fontSize: size}}><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>; }

interface ChatPanelProps {
  messages: Message[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  voiceMode: boolean;
  onVoiceModeToggle: () => void;
  aiMode: "edge" | "sarvam";
  onAiModeToggle: () => void;
  sarvamSTTState: "idle" | "recording" | "processing" | "error";
  onSarvamSTTToggle: () => void;
}

export default function ChatPanel({
  messages,
  isThinking,
  onSend,
  onStop,
  voiceMode,
  onVoiceModeToggle,
  aiMode,
  onAiModeToggle,
  sarvamSTTState,
  onSarvamSTTToggle,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-black/10 rounded-xl shadow-soft overflow-hidden relative">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10">
            <div className="text-center space-y-3">
              <h1 className="heading-editorial text-3xl">What can I do for you?</h1>
              <p className="text-muted font-sans text-sm">Select a quick command or type your own</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => onSend(cmd.label)}
                  className="flex items-center gap-3 p-4 bg-cream border border-black/5 rounded-xl hover:border-bronze hover:bg-parchment-light transition-all text-left text-ink shadow-sm"
                >
                  <span className="text-bronze">{cmd.icon}</span>
                  <span className="font-sans text-sm font-medium">{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 items-start animate-fade-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 text-white font-serif font-bold text-sm shadow-sm ${msg.role === "user" ? "bg-ink" : "bg-bronze"}`}>
              {msg.role === "user" ? "U" : "A"}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] p-4 ${msg.role === "user" ? "bg-cream border border-black/5 rounded-[16px_4px_16px_16px]" : "bg-white border border-black/10 shadow-sm rounded-[4px_16px_16px_16px]"}`}>
              
              {/* Task type badge */}
              {msg.taskType && msg.taskType !== "chat" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="label-mono text-[0.65rem] text-bronze px-2 py-0.5 bg-bronze/10 rounded-sm">
                    {msg.taskType}
                  </span>
                </div>
              )}

              <div className="font-sans text-[0.9rem] text-ink whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              {/* File card */}
              {msg.fileCard && (
                <div className="mt-4 p-3 bg-cream border border-black/10 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-muted">
                      {msg.fileCard.file_type === "html" ? <Globe size={16}/>
                        : msg.fileCard.file_type === "docx" ? <FileText size={16}/>
                        : msg.fileCard.file_type === "code" ? <Code size={16}/>
                        : <FileIcon size={16}/>}
                    </span>
                    <span className="font-mono text-xs text-ink truncate">
                      {msg.fileCard.name}
                    </span>
                  </div>
                  <Link
                    href={`/editor?path=${encodeURIComponent(msg.fileCard.path)}`}
                    target="_blank"
                    className="flex-shrink-0 px-3 py-1.5 bg-ink text-white font-mono text-[0.65rem] uppercase tracking-widest rounded-md hover:bg-bronze transition-colors"
                  >
                    Open Editor →
                  </Link>
                </div>
              )}

              <div className={`mt-2 font-mono text-[0.65rem] text-meta ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-4 items-start animate-fade-up">
            <div className="w-8 h-8 rounded bg-bronze flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm flex-shrink-0">
              A
            </div>
            <div className="p-4 bg-white border border-black/10 shadow-sm rounded-[4px_16px_16px_16px] flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                    key={i} 
                    className="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse" 
                    style={{ animationDelay: `${i * 150}ms` }} 
                />
              ))}
            </div>
            {onStop && (
                <button
                    onClick={onStop}
                    title="Stop Task"
                    className="mt-2 p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors border border-red-200 shadow-sm flex items-center gap-1 text-xs font-mono font-medium"
                >
                    <X size={14} /> Stop
                </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-black/5">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          
          <VoiceButton
            onTranscript={(text) => {
              setInput(text);
              setTimeout(handleSend, 100);
            }}
            disabled={isThinking}
          />

          <div className="flex-1 relative">
            <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything or command VENOM..."
                disabled={isThinking}
                rows={1}
                className="w-full input-editorial resize-none max-h-32 overflow-y-auto pr-24 py-3 min-h-[48px]"
            />
            
            {/* Inner Controls */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                    onClick={onAiModeToggle}
                    className="label-mono flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 text-muted transition-colors"
                    title="Toggle Sarvam/Edge"
                >
                    <Bot size={14} className={aiMode === "sarvam" ? "text-bronze" : ""} />
                    {aiMode === "sarvam" ? "SRV" : "EDG"}
                </button>
                
                {aiMode === "sarvam" && (
                    <button
                        onClick={onSarvamSTTToggle}
                        className={`p-1.5 rounded-full transition-colors ${sarvamSTTState === 'recording' ? 'bg-red-50 text-red-500 animate-pulse' : 'text-muted hover:bg-black/5 hover:text-bronze'}`}
                    >
                        {sarvamSTTState === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                    </button>
                )}

                {aiMode === "edge" && (
                    <button
                        onClick={onVoiceModeToggle}
                        className={`p-1.5 rounded-full transition-colors ${voiceMode ? 'text-bronze bg-bronze/10' : 'text-muted hover:bg-black/5'}`}
                    >
                        {voiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                )}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors shadow-sm ${!input.trim() || isThinking ? 'bg-parchment text-muted cursor-not-allowed' : 'bg-ink text-cream hover:bg-bronze'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
