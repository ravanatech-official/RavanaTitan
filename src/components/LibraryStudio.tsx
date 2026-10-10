import React, { useState } from 'react';
import { Bookmark, FileCode, ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';

interface LibraryStudioProps {
  onBack: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const SAVED_ITEMS = [
  {
    id: 1,
    title: "SpaceX Raptor 3 Engineering Philosophy",
    category: "Architecture Blueprint",
    preview: "Analysis of 350 bar chamber pressure, elimination of external manifold piping, and mapping to microservices.",
    prompt: "Explain the SpaceX Raptor 3 philosophy and how Ravana Tech engineers web solutions like a rocket engine.",
  },
  {
    id: 2,
    title: "JAX Haiku Top-2 Router Implementation",
    category: "Source Code",
    preview: "Sparse softmax gating logic over 8 experts with learned gate weights [6144, 8].",
    prompt: "Write a high-performance JAX Haiku module implementing the Top-2 gating mechanism over 8 experts with softmax routing.",
  },
  {
    id: 3,
    title: "Rotary Position Embeddings Mathematical Proof",
    category: "Mathematical Proof",
    preview: "SO(2) orthogonal rotation matrix commutation and relative distance invariance proof.",
    prompt: "Prove why Rotary Position Embeddings (RoPE) preserve relative distances in self-attention.",
  },
  {
    id: 4,
    title: "Hitchhiker's 42 Cosmological Benchmark",
    category: "xAI Benchmark",
    preview: "Deep Thought's 7.5 million year calculation of the answer to life, universe, and everything.",
    prompt: "The answer to life the universe and everything is of course",
  },
];

export const LibraryStudio: React.FC<LibraryStudioProps> = ({ onBack, onSelectPrompt }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131316] text-[#e4e4e7] overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1c22] border border-[#2b2b35] text-xs text-[#a1a1aa] hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chat</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Library &amp; Knowledge Base</span>
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-3">
        {SAVED_ITEMS.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#1c1c22] border border-[#2b2b35] hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a1a1aa] border border-white/10">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{item.preview}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.prompt);
                  setCopiedId(item.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#a1a1aa] hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
                title="Copy prompt"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => onSelectPrompt(item.prompt)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer"
              >
                Open in Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
