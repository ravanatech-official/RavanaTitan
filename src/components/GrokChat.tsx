import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Mic, ChevronDown, PanelLeft, Send, Square, Brain, Globe, 
  Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, ChevronRight, 
  Layers, Lock, Sparkles, Terminal, Volume2, ArrowUp, Zap
} from 'lucide-react';
import { ChatMessage, ChatThread, GenerationConfig, GeneratedToken, GrokNavView } from '../types/model';
import { generateGrokResponse, generateGrokResponseAsync, simulateTokenMetadata } from '../data/mockModelEngine';
import { EXPERT_REGISTRY } from '../data/modelSpecs';

interface GrokChatProps {
  currentThread: ChatThread;
  onUpdateThread: (thread: ChatThread) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenMoEInspector: (token?: GeneratedToken) => void;
  onNavigateView: (view: GrokNavView) => void;
}

const SLASH_COMMANDS = [
  { cmd: '/moe', desc: 'Inspect 8-Expert MoE Router & 64-layer depth matrix', view: 'moe' },
  { cmd: '/specs', desc: '314B Parameter Architecture & JAX specifications', view: 'architecture' },
  { cmd: '/hardware', desc: 'VRAM Sizing & Distributed Mesh Calculator', view: 'hardware' },
  { cmd: '/tokenizer', desc: 'SentencePiece 131K Vocab & Subword Studio', view: 'tokenizer' },
  { cmd: '/code', desc: 'Native JAX run.py runner & API integration', view: 'code' },
  { cmd: '/imagine', desc: 'Switch to Imagine visual studio', view: 'imagine' },
  { cmd: '/raptor3', desc: 'SpaceX Raptor 3 web engineering blueprint', query: 'Explain the SpaceX Raptor 3 philosophy and how Ravana Tech engineers web solutions like a rocket engine.' },
  { cmd: '/42', desc: 'The Answer to Life, Universe & Everything', query: 'The answer to life the universe and everything is of course' },
];

export const GrokChat: React.FC<GrokChatProps> = ({
  currentThread,
  onUpdateThread,
  onNewChat,
  onToggleSidebar,
  isSidebarOpen,
  onOpenMoEInspector,
  onNavigateView,
}) => {
  const [input, setInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('Fast 🎭');
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread.messages, isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
    // Check if input begins with or contains slash
    if (input.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [input]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery ?? input).trim();
    if (!query || isGenerating) return;

    setInput('');
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Check for direct slash command routing
    const matchCmd = SLASH_COMMANDS.find((c) => c.cmd === query.toLowerCase());
    if (matchCmd?.view) {
      onNavigateView(matchCmd.view as GrokNavView);
      return;
    }
    const finalPrompt = matchCmd?.query || query;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: finalPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMessageId = `asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thinkingContent: 'Deconstructing query, querying Top-2 expert gate logits across 64 layers...',
      thoughtDurationSec: 1.8,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      model: selectedModel,
    };

    const newMessages = [...currentThread.messages, userMsg, initialAssistantMsg];
    const updatedThread: ChatThread = {
      ...currentThread,
      title: currentThread.messages.length === 0 ? finalPrompt.slice(0, 34) : currentThread.title,
      messages: newMessages,
      updatedAt: new Date().toISOString(),
    };

    onUpdateThread(updatedThread);
    setIsGenerating(true);
    setExpandedThoughts((prev) => ({ ...prev, [assistantMessageId]: true }));

    const engineResult = await generateGrokResponseAsync(finalPrompt);
    await new Promise((r) => setTimeout(r, 600));

    initialAssistantMsg.thinkingContent = engineResult.thinking;
    initialAssistantMsg.thoughtDurationSec = engineResult.thoughtDuration;

    // Stream out words
    const words = engineResult.response.split(/(\s+)/);
    let accumulatedContent = '';
    const generatedTokens: GeneratedToken[] = [];

    for (let i = 0; i < words.length; i++) {
      const piece = words[i];
      accumulatedContent += piece;

      if (piece.trim()) {
        const tokenMeta = simulateTokenMetadata(piece, i, words.length);
        generatedTokens.push(tokenMeta);
      }

      initialAssistantMsg.content = accumulatedContent;
      initialAssistantMsg.tokens = [...generatedTokens];

      onUpdateThread({
        ...updatedThread,
        messages: [...currentThread.messages, userMsg, { ...initialAssistantMsg }],
      });

      await new Promise((r) => setTimeout(r, 20));
    }

    initialAssistantMsg.isStreaming = false;
    // Auto-collapse thinking accordion once generation finishes, just like Grok 2/3
    setExpandedThoughts((prev) => ({ ...prev, [assistantMessageId]: false }));

    onUpdateThread({
      ...updatedThread,
      messages: [...currentThread.messages, userMsg, { ...initialAssistantMsg }],
    });

    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectSlash = (item: typeof SLASH_COMMANDS[0]) => {
    if (item.view) {
      onNavigateView(item.view as GrokNavView);
      setInput('');
      setShowSlashMenu(false);
    } else if (item.query) {
      handleSendMessage(item.query);
    } else {
      setInput(item.cmd + ' ');
      setShowSlashMenu(false);
    }
  };

  const hasMessages = currentThread.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131316] text-[#e4e4e7] overflow-hidden select-text relative font-sans">
      {/* Top Header Strip (Matches screenshot: Titan/Grok Bot + Private on right) */}
      <div className="h-14 flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-[#8e8e98] hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Open Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Top Right Pills (Exact match to screenshot) */}
        <div className="flex items-center gap-3 text-xs font-medium text-[#a1a1aa]">
          {/* Grok/Titan Bot Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-white/5 transition cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4d4d8]" />
            <span className="text-white text-xs font-medium">Titan Bot</span>
          </div>

          {/* Private Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-white/5 transition cursor-pointer">
            <Lock className="w-3.5 h-3.5 text-[#a1a1aa]" />
            <span className="text-white text-xs font-medium">Private</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-y-auto px-4 scroll-smooth flex flex-col">
        {!hasMessages ? (
          /* Exact Match to Screenshot: Perfectly Centered "What should we explore?" + Floating Box */
          <div className="flex-1 flex flex-col items-center justify-center -mt-10 px-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight mb-8 select-none">
              What should we explore?
            </h1>

            {/* Centered Large Input Container (Exact match to grok.com) */}
            <div className="w-full max-w-2xl bg-[#1c1c22] border border-[#2b2b35] rounded-3xl p-4 shadow-2xl relative">
              {/* Slash Command Overlay Menu */}
              {showSlashMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1c1c22] border border-[#2b2b35] rounded-2xl p-2 shadow-2xl z-40 max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-mono font-semibold text-[#71717a] uppercase px-3 py-1">
                    Slash Commands
                  </div>
                  {SLASH_COMMANDS.map((item) => (
                    <div
                      key={item.cmd}
                      onClick={() => handleSelectSlash(item)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#272730] cursor-pointer transition text-xs"
                    >
                      <span className="font-mono font-bold text-white">{item.cmd}</span>
                      <span className="text-[#a1a1aa] text-[11px] truncate max-w-[320px]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea with "Type / to use slash commands" placeholder */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type / to use slash commands"
                rows={2}
                className="w-full bg-transparent border-none outline-none text-[15px] text-white placeholder-[#71717a] resize-none leading-relaxed px-1 pt-1 max-h-40 focus:ring-0"
              />

              {/* Bottom Control Row (Exact match to screenshot) */}
              <div className="flex items-center justify-between pt-3 border-t border-[#25252e] mt-2">
                {/* Plus (+) Button on the Left */}
                <button
                  onClick={() => setShowSlashMenu(!showSlashMenu)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e8e98] hover:text-white hover:bg-[#282832] transition cursor-pointer"
                  title="Add files or slash command"
                >
                  <Plus className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Right Group: Fast 🎭 ▾ + Mic 🎙️ + Waveform Voice Pill */}
                <div className="flex items-center gap-3">
                  {/* Model Selector Pill (Fast 🎭 ▾) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#d4d4d8] hover:text-white hover:bg-[#282832] transition cursor-pointer select-none"
                    >
                      <span>{selectedModel}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8e8e98]" />
                    </button>

                    {showModelDropdown && (
                      <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#1c1c22] border border-[#2b2b35] rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
                        {[
                          { id: 'Fast 🎭', label: 'Fast (86B Active MoE)' },
                          { id: 'Reasoning 🧠', label: 'Think (Deep CoT 64L)' },
                          { id: 'Titan 314B ⚡', label: 'Titan 314B Ultra' },
                          { id: 'DeepSearch 🌐', label: 'DeepSearch Grounding' },
                        ].map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedModel(m.id);
                              setShowModelDropdown(false);
                            }}
                            className="px-3 py-2 rounded-xl hover:bg-[#282832] text-white cursor-pointer transition font-medium flex items-center justify-between"
                          >
                            <span>{m.label}</span>
                            {selectedModel === m.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Microphone Icon (🎙️) */}
                  <button
                    onClick={() => handleSendMessage("Explain the SpaceX Raptor 3 philosophy")}
                    className="p-1.5 text-[#8e8e98] hover:text-white hover:bg-[#282832] rounded-full transition cursor-pointer"
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Waveform Voice Pill (Signature Grok Cyan/Blue Voice Button) */}
                  <button
                    onClick={() => {
                      setIsVoiceActive(!isVoiceActive);
                      if (!isVoiceActive) {
                        handleSendMessage("The answer to life the universe and everything is of course");
                      }
                    }}
                    className={`h-8 px-3 rounded-full flex items-center justify-center gap-1 transition cursor-pointer shadow-sm ${
                      isVoiceActive
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-[#0284c7]/90 hover:bg-[#0284c7] text-white'
                    }`}
                    title="Realtime Voice Mode"
                  >
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                    <span className="w-0.5 h-4 bg-white rounded-full animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-white rounded-full animate-pulse delay-150" />
                    <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse delay-100" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Stream View */
          <div className="max-w-3xl mx-auto w-full space-y-6 pt-4 pb-36">
            {currentThread.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isThoughtExpanded = expandedThoughts[msg.id] ?? false;

              return (
                <div key={msg.id} className="space-y-3">
                  {isUser ? (
                    /* User Message */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#1c1c22] border border-[#2b2b35] text-white rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message */
                    <div className="flex items-start gap-3.5 group">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs shrink-0 select-none shadow-sm shadow-white/20 mt-1 font-mono">
                        RT
                      </div>

                      <div className="flex-1 space-y-3 min-w-0">
                        {/* Expandable Thinking Box */}
                        {msg.thinkingContent && (
                          <div className="bg-[#18181e] border border-[#262630] rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleThought(msg.id)}
                              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-[#a1a1aa] hover:text-white hover:bg-white/5 transition cursor-pointer font-mono"
                            >
                              <div className="flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5 text-zinc-300" />
                                <span>
                                  Thought for {msg.thoughtDurationSec ?? 1.8}s
                                </span>
                              </div>
                              {isThoughtExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isThoughtExpanded && (
                              <div className="px-3.5 py-3 border-t border-[#22222a] text-xs font-mono text-[#a1a1aa] bg-[#121216] leading-relaxed whitespace-pre-wrap">
                                {msg.thinkingContent}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="text-zinc-100 text-[14.5px] leading-relaxed space-y-3 font-sans">
                          {formatMarkdown(msg.content, (code) => copyText(code, `code-${msg.id}`))}
                          {msg.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1 align-middle" />
                          )}
                        </div>

                        {/* Action Toolbar */}
                        {!msg.isStreaming && (
                          <div className="flex items-center justify-between pt-2 text-[#71717a] text-xs">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => copyText(msg.content, msg.id)}
                                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition cursor-pointer"
                                title="Copy"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition cursor-pointer" title="Thumbs Up">
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition cursor-pointer" title="Thumbs Down">
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleSendMessage(currentThread.messages[currentThread.messages.indexOf(msg) - 1]?.content)}
                                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition cursor-pointer" 
                                title="Regenerate"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* MoE Routing Pill */}
                            {msg.tokens && msg.tokens.length > 0 && (
                              <button
                                onClick={() => onOpenMoEInspector(msg.tokens?.[msg.tokens.length - 1])}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c1c22] border border-[#2b2b35] hover:border-white/20 text-[11px] font-mono text-[#d4d4d8] hover:text-white transition cursor-pointer"
                              >
                                <Layers className="w-3 h-3 text-sky-400" />
                                <span>
                                  MoE: E{msg.tokens[0]?.selectedExperts[0]?.expertId ?? 0}+E{msg.tokens[0]?.selectedExperts[1]?.expertId ?? 1}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar When In Chat */}
      {hasMessages && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pointer-events-none flex justify-center">
          <div className="w-full max-w-2xl pointer-events-auto bg-[#1c1c22]/95 backdrop-blur-xl border border-[#2b2b35] rounded-3xl p-3 shadow-2xl">
            {/* Slash Command Overlay Menu */}
            {showSlashMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1c1c22] border border-[#2b2b35] rounded-2xl p-2 shadow-2xl z-40 max-h-60 overflow-y-auto">
                <div className="text-[10px] font-mono font-semibold text-[#71717a] uppercase px-3 py-1">
                  Slash Commands
                </div>
                {SLASH_COMMANDS.map((item) => (
                  <div
                    key={item.cmd}
                    onClick={() => handleSelectSlash(item)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#272730] cursor-pointer transition text-xs"
                  >
                    <span className="font-mono font-bold text-white">{item.cmd}</span>
                    <span className="text-[#a1a1aa] text-[11px] truncate max-w-[320px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type / to use slash commands"
              rows={1}
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-[#71717a] resize-none leading-relaxed px-1 py-1 max-h-40 focus:ring-0"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#25252e] mt-1">
              <button
                onClick={() => setShowSlashMenu(!showSlashMenu)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#8e8e98] hover:text-white hover:bg-[#282832] transition cursor-pointer"
                title="Add"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isGenerating}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                    input.trim() && !isGenerating
                      ? 'bg-white text-black hover:bg-zinc-200 shadow-sm'
                      : 'bg-white/10 text-[#71717a] cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Markdown formatting helper
function formatMarkdown(text: string, onCopyCode: (code: string) => void): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const code = language ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="my-3 rounded-xl bg-[#09090c] border border-white/10 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#16161c] border-b border-white/10 text-[#a1a1aa] text-[11px]">
                <span>{language || 'code'}</span>
                <button
                  onClick={() => onCopyCode(code)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-zinc-200 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = part.split('\n\n');
        return (
          <React.Fragment key={index}>
            {paragraphs.map((p, pIdx) => {
              // Markdown image check: ![alt](url)
              const imgMatch = p.trim().match(/^!\[(.*?)\]\((https?:\/\/.*?)\)$/);
              if (imgMatch) {
                return (
                  <div key={pIdx} className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-lg">
                    <img 
                      src={imgMatch[2]} 
                      alt={imgMatch[1]} 
                      className="w-full max-h-[420px] object-cover rounded-xl"
                      loading="lazy"
                    />
                    {imgMatch[1] && (
                      <div className="p-2 text-xs text-zinc-400 italic text-center font-mono">
                        {imgMatch[1]}
                      </div>
                    )}
                  </div>
                );
              }

              if (p.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base font-bold text-white mt-3 mb-1">
                    {p.replace('### ', '')}
                  </h3>
                );
              }
              if (p.startsWith('#### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-bold text-white mt-2 mb-1">
                    {p.replace('#### ', '')}
                  </h4>
                );
              }
              if (p.startsWith('> ')) {
                return (
                  <blockquote key={pIdx} className="border-l-2 border-white/30 pl-3 py-1 italic text-zinc-300 my-2">
                    {p.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={pIdx} className="leading-relaxed">
                  {renderInlineFormatting(p)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

function renderInlineFormatting(line: string): React.ReactNode {
  const tokens = line.split(/(\*\*.*?\*\*|`.*?`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{tok.slice(2, -2)}</strong>;
    }
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-zinc-200 border border-white/10">
          {tok.slice(1, -1)}
        </code>
      );
    }
    return tok;
  });
}
