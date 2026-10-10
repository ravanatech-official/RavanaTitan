import React from 'react';
import { 
  Search, PanelLeft, MessageSquare, Image as ImageIcon, Bookmark, 
  Zap, Plus, Puzzle, Settings, ChevronRight, X, Trash2
} from 'lucide-react';
import { ChatThread, GrokNavView } from '../types/model';

interface GrokSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeView: GrokNavView;
  setActiveView: (view: GrokNavView) => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string, e: React.MouseEvent) => void;
  onOpenSettings?: () => void;
}

export const GrokSidebar: React.FC<GrokSidebarProps> = ({
  isOpen,
  setIsOpen,
  activeView,
  setActiveView,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onOpenSettings,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0e0e11] border-r border-[#222228] transition-all duration-200 select-none ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="h-14 flex items-center justify-between px-3.5 pt-2">
          {/* Logo */}
          <div 
            onClick={() => { setActiveView('chat'); onNewChat(); }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white/90 group-hover:text-white transition">
              {/* Minimalist Grok/Titan slash polygon mark */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white font-mono tracking-tight">
              RavanaTitan
            </span>
          </div>

          {/* Action icons on top right of sidebar */}
          <div className="flex items-center gap-1 text-[#8e8e98]">
            <button 
              className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Navigation Items (Chat, Imagine, Library, Automations) */}
        <div className="px-2 py-3 space-y-0.5 text-[13px] font-medium">
          {/* Chat (Active pill) */}
          <button
            onClick={() => { setActiveView('chat'); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
              activeView === 'chat'
                ? 'bg-[#24242b] text-white font-semibold'
                : 'text-[#9b9ba6] hover:text-white hover:bg-[#1a1a20]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-inherit" />
              <span>Chat</span>
            </div>
          </button>

          {/* Imagine (with blue dot) */}
          <button
            onClick={() => setActiveView('imagine')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
              activeView === 'imagine'
                ? 'bg-[#24242b] text-white font-semibold'
                : 'text-[#9b9ba6] hover:text-white hover:bg-[#1a1a20]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4 text-inherit" />
              <span>Imagine</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          </button>

          {/* Library */}
          <button
            onClick={() => setActiveView('library')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
              activeView === 'library'
                ? 'bg-[#24242b] text-white font-semibold'
                : 'text-[#9b9ba6] hover:text-white hover:bg-[#1a1a20]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-inherit" />
              <span>Library</span>
            </div>
          </button>

          {/* Automations */}
          <button
            onClick={() => setActiveView('automations')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
              activeView === 'automations'
                ? 'bg-[#24242b] text-white font-semibold'
                : 'text-[#9b9ba6] hover:text-white hover:bg-[#1a1a20]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-inherit" />
              <span>Automations</span>
            </div>
          </button>
        </div>

        {/* Projects Section */}
        <div className="px-3 pt-3 pb-1">
          <div className="text-[11px] font-semibold text-[#6f6f79] tracking-wider mb-1.5">
            Projects
          </div>
          <button 
            onClick={onNewChat}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#9b9ba6] hover:text-white hover:bg-white/5 rounded-lg w-full transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#8e8e98]" />
            <span>Add project</span>
          </button>
        </div>

        {/* Chats History Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold text-[#6f6f79] tracking-wider mb-1">
            Chats
          </div>

          <div className="space-y-0.5">
            {threads.map((t) => {
              const isSelected = t.id === activeThreadId && activeView === 'chat';
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveView('chat');
                    onSelectThread(t.id);
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#24242b] text-white font-medium'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#1a1a20]'
                  }`}
                >
                  <span className="truncate pr-2">{t.title}</span>
                  <button
                    onClick={(e) => onDeleteThread(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setActiveView('library')}
            className="text-[11px] text-[#71717a] hover:text-[#a1a1aa] px-2 py-1 block transition cursor-pointer mt-1"
          >
            See all
          </button>
        </div>

        {/* Bottom Section (Plugins & User Profile) */}
        <div className="p-2 border-t border-[#1e1e24] space-y-1">
          {/* Plugins */}
          <button 
            onClick={() => setActiveView('moe')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#9b9ba6] hover:text-white hover:bg-[#1a1a20] transition cursor-pointer"
          >
            <Puzzle className="w-4 h-4 text-inherit" />
            <span>Plugins &amp; MoE</span>
          </button>

          {/* User Profile Card (Matches exact profile in screenshot) */}
          <div 
            onClick={onOpenSettings}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1a1a20] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                SS
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">
                  Shanthapriya Silva
                </span>
                <span className="text-[10px] text-[#71717a] truncate font-mono">
                  Ravana Tech
                </span>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#71717a] hover:text-white transition" />
          </div>
        </div>
      </aside>
    </>
  );
};
