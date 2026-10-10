import React from 'react';
import { Cpu, Zap, Network, Activity, Sliders, Database, Code2, Server } from 'lucide-react';

export type ActiveTab = 'playground' | 'moe' | 'architecture' | 'tokenizer' | 'hardware' | 'code';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isGenerating }) => {
  const tabs = [
    { id: 'playground', label: 'Playground', icon: Zap },
    { id: 'moe', label: '8-Expert MoE Router', icon: Network },
    { id: 'architecture', label: '314B Architecture', icon: Cpu },
    { id: 'tokenizer', label: 'SentencePiece Studio', icon: Database },
    { id: 'hardware', label: 'Mesh & VRAM Calculator', icon: Server },
    { id: 'code', label: 'JAX Code & API', icon: Code2 },
  ] as const;

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Model Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Network className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  RavanaTitan
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                  314B MoE
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                  JAX/Haiku
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Ravana Tech Foundation Model &amp; AI Intelligence Platform
              </p>
            </div>
          </div>

          {/* Runtime Status */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-slate-300">
                {isGenerating ? 'Routing Tokens...' : 'Cluster: 8x H100 Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Active:</span>
              <span className="text-indigo-400 font-bold">86B / 314B</span>
              <span className="text-slate-600">|</span>
              <span>Context:</span>
              <span className="text-cyan-400 font-bold">8,192 tok</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
