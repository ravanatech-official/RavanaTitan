import React, { useState, useEffect } from 'react';
import { GrokSidebar } from './components/GrokSidebar';
import { GrokChat } from './components/GrokChat';
import { ImagineStudio } from './components/ImagineStudio';
import { LibraryStudio } from './components/LibraryStudio';
import { AutomationsStudio } from './components/AutomationsStudio';
import { MoeVisualizer } from './components/MoeVisualizer';
import { ArchitectureSpecs } from './components/ArchitectureSpecs';
import { TokenizerStudio } from './components/TokenizerStudio';
import { HardwareCalculator } from './components/HardwareCalculator';
import { CodeApiExport } from './components/CodeApiExport';
import { ChatThread, GeneratedToken, GrokNavView } from './types/model';
import { EXPERT_REGISTRY } from './data/modelSpecs';
import { X, Layers, ArrowLeft } from 'lucide-react';

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-welcome',
    title: 'SpaceX Raptor 3 Architecture',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'thread-2',
    title: '314B MoE Router Logic',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'thread-3',
    title: 'The Answer to Life and 42',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function App() {
  const [activeView, setActiveView] = useState<GrokNavView>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [inspectedToken, setInspectedToken] = useState<GeneratedToken | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleUpdateThread = (updated: ChatThread) => {
    setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleNewChat = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setActiveView('chat');
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      handleNewChat();
      return;
    }
    const filtered = threads.filter((t) => t.id !== id);
    setThreads(filtered);
    if (activeThreadId === id) {
      setActiveThreadId(filtered[0].id);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131316] text-[#e4e4e7] font-sans antialiased">
      {/* Grok Exact Sidebar */}
      <GrokSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
      />

      {/* Main Viewport Container */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-200 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        {activeView === 'chat' && (
          <GrokChat
            currentThread={currentThread}
            onUpdateThread={handleUpdateThread}
            onNewChat={handleNewChat}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            onOpenMoEInspector={(token) => setInspectedToken(token || null)}
            onNavigateView={setActiveView}
          />
        )}

        {activeView === 'imagine' && (
          <ImagineStudio onBack={() => setActiveView('chat')} />
        )}

        {activeView === 'library' && (
          <LibraryStudio
            onBack={() => setActiveView('chat')}
            onSelectPrompt={(p) => {
              setActiveView('chat');
              // switch to active thread
            }}
          />
        )}

        {activeView === 'automations' && (
          <AutomationsStudio onBack={() => setActiveView('chat')} />
        )}

        {/* Deep Engine Tool Views */}
        {activeView !== 'chat' && activeView !== 'imagine' && activeView !== 'library' && activeView !== 'automations' && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#131316]">
            {/* Top Bar for Engine Views */}
            <div className="h-14 border-b border-[#222228] px-6 flex items-center justify-between bg-[#131316]/90 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('chat')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1c22] hover:bg-[#272730] border border-[#2b2b35] text-xs text-[#a1a1aa] hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Chat</span>
                </button>
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="text-xs font-bold text-white capitalize font-mono">
                  {activeView === 'moe' && '8-Expert Mixture-of-Experts Router'}
                  {activeView === 'architecture' && '314B Parameter Architecture Specifications'}
                  {activeView === 'hardware' && 'Distributed Mesh & VRAM Cluster Calculator'}
                  {activeView === 'tokenizer' && 'SentencePiece 131K Tokenizer Studio'}
                  {activeView === 'code' && 'Native JAX Code & API Integration'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
              {activeView === 'moe' && <MoeVisualizer />}
              {activeView === 'architecture' && <ArchitectureSpecs />}
              {activeView === 'hardware' && <HardwareCalculator />}
              {activeView === 'tokenizer' && <TokenizerStudio />}
              {activeView === 'code' && <CodeApiExport />}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for MoE Token Inspection */}
      {inspectedToken && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#18181e] border-l border-[#2c2c36] h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262630] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  MoE Router Token Telemetry
                </h3>
              </div>
              <button
                onClick={() => setInspectedToken(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black border border-white/10 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Token Text:</span>
                <span className="text-white font-bold">&quot;{inspectedToken.text}&quot;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SentencePiece ID:</span>
                <span className="text-emerald-400 font-bold">{inspectedToken.id} / 131,072</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Log-Probability:</span>
                <span className="text-cyan-400 font-bold">{inspectedToken.logprob}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
                Active Top-2 Experts (Softmax Gating)
              </h4>
              <div className="space-y-3">
                {inspectedToken.selectedExperts.map((exp, idx) => {
                  const expertMeta = EXPERT_REGISTRY[exp.expertId];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-black/80 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">
                          Expert {exp.expertId}: {expertMeta?.domain}
                        </span>
                        <span className="font-extrabold text-white bg-white/10 px-2 py-0.5 rounded">
                          {(exp.weight * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        {expertMeta?.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-2">
              <span className="font-bold text-white block">Why Top-2 Sparse Routing?</span>
              <p className="leading-relaxed text-[11px] text-zinc-400">
                RavanaTitan activates only 2 out of 8 experts per token. This keeps compute costs at 86B parameters while retaining the full capacity and depth of the 314B model.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
