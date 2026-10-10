import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, Clock, ArrowLeft, RefreshCw, Terminal } from 'lucide-react';

interface AutomationsStudioProps {
  onBack: () => void;
}

const AUTOMATIONS = [
  {
    id: 1,
    name: "Sub-20ms Edge Web Performance Watchdog",
    desc: "Simulates synthetic transactions and verifies zero-slop 60 FPS client bundle performance.",
    interval: "Every 15 min",
    status: "Active",
  },
  {
    id: 2,
    name: "MoE Router Auxiliary Entropy Monitor",
    desc: "Audits load-balancing distribution across the 8 experts to avoid winner-take-all collapse.",
    interval: "Continuous",
    status: "Active",
  },
  {
    id: 3,
    name: "JAX Distributed Mesh Heartbeat",
    desc: "Monitors 8x H100 GPU tensor memory and NVLink interconnect status.",
    interval: "Every 1 min",
    status: "Active",
  },
];

export const AutomationsStudio: React.FC<AutomationsStudioProps> = ({ onBack }) => {
  const [runningId, setRunningId] = useState<number | null>(null);

  const handleRunNow = async (id: number) => {
    setRunningId(id);
    await new Promise((r) => setTimeout(r, 1000));
    setRunningId(null);
  };

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
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Automations &amp; Workflows</span>
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-3">
        {AUTOMATIONS.map((auto) => (
          <div
            key={auto.id}
            className="p-4 rounded-2xl bg-[#1c1c22] border border-[#2b2b35] hover:border-white/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">{auto.name}</h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                  {auto.status}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{auto.desc}</p>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#71717a] pt-1">
                <Clock className="w-3 h-3" />
                <span>{auto.interval}</span>
              </div>
            </div>

            <button
              onClick={() => handleRunNow(auto.id)}
              disabled={runningId === auto.id}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {runningId === auto.id ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{runningId === auto.id ? 'Executing...' : 'Run Trigger'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
