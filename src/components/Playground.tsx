import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Sparkles, RefreshCw, Copy, Check, Sliders, 
  Layers, Gauge, Activity, Info, ChevronRight, Terminal, ArrowRight
} from 'lucide-react';
import { PRESET_PROMPTS, EXPERT_REGISTRY, RAVANA_TITAN_SPEC } from '../data/modelSpecs';
import { getSimulatedResponseTokens, simulateTokenMetadata, tokenizeText } from '../data/mockModelEngine';
import { GeneratedToken, GenerationConfig, GenerationMetrics } from '../types/model';

interface PlaygroundProps {
  onTokenGenerated?: (token: GeneratedToken) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ 
  onTokenGenerated, 
  isGenerating, 
  setIsGenerating 
}) => {
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0].prompt);
  const [config, setConfig] = useState<GenerationConfig>({
    temperature: 0.01, // default in run.py
    topP: 0.95,
    maxTokens: 150,
    repetitionPenalty: 1.1,
    seed: 42,
  });

  const [tokens, setTokens] = useState<GeneratedToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<GeneratedToken | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<GenerationMetrics>({
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    elapsedMs: 0,
    tokensPerSec: 0,
    ttftMs: 114,
    kvCacheMb: 0,
    activeVramGb: 314.8,
  });

  const abortRef = useRef<boolean>(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Compute prompt tokens count
  const promptTokenCount = tokenizeText(prompt).tokens.length;

  const handleStartInference = async () => {
    if (isGenerating) return;
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTokens([]);
    setSelectedToken(null);
    abortRef.current = false;

    const startTime = performance.now();
    const simulatedWords = getSimulatedResponseTokens(prompt);
    const maxToGenerate = Math.min(simulatedWords.length, config.maxTokens);

    let generatedCount = 0;
    const accumulatedTokens: GeneratedToken[] = [];

    // Calculate delay per token based on simulated speed (~38-48 tok/s)
    const baseDelay = Math.max(18, Math.floor(1000 / (42 * Math.max(0.5, 1 - config.temperature * 0.2))));

    for (let i = 0; i < maxToGenerate; i++) {
      if (abortRef.current) break;

      const word = simulatedWords[i];
      const tokenMeta = simulateTokenMetadata(word, i, maxToGenerate);
      accumulatedTokens.push(tokenMeta);
      generatedCount++;

      setTokens([...accumulatedTokens]);
      if (onTokenGenerated) {
        onTokenGenerated(tokenMeta);
      }

      // Update metrics
      const elapsed = performance.now() - startTime;
      const speed = elapsed > 0 ? (generatedCount / (elapsed / 1000)) : 0;
      const kvMb = Math.round(((promptTokenCount + generatedCount) * RAVANA_TITAN_SPEC.embSize * 2 * 64 * 2) / (1024 * 1024));

      setMetrics({
        totalTokens: promptTokenCount + generatedCount,
        promptTokens: promptTokenCount,
        completionTokens: generatedCount,
        elapsedMs: Math.round(elapsed),
        tokensPerSec: parseFloat(speed.toFixed(1)),
        ttftMs: 108,
        kvCacheMb: Math.max(12, kvMb),
        activeVramGb: 314.8,
      });

      // Scroll to bottom smoothly
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      await new Promise((r) => setTimeout(r, baseDelay));
    }

    setIsGenerating(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsGenerating(false);
  };

  const handleCopy = () => {
    const text = tokens.map((t) => t.text).join('');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastToken = tokens[tokens.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner / System Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3 h-3" />
              Inference Mode: JAX Distributed MoE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ckpt-0 (314B, 64L, 8-bit QW8Bit)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            RavanaTitan Interactive Inference Engine
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Simulates dynamic Top-2 routing across 8 sparse experts with SentencePiece 131K tokenizer and JAX Haiku 64-layer pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showConfig 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sampling Parameters</span>
          </button>
        </div>
      </div>

      {/* Sampling Parameter Drawer */}
      {showConfig && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Temperature</span>
              <span className="text-indigo-400 font-bold">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.01"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Default 0.01 for deterministic reasoning</p>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Top-P Nucleus</span>
              <span className="text-cyan-400 font-bold">{config.topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.topP}
              onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Cumulative probability cutoff</p>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Max Tokens</span>
              <span className="text-amber-400 font-bold">{config.maxTokens}</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={config.maxTokens}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Output length cap per request</p>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Repetition Penalty</span>
              <span className="text-emerald-400 font-bold">{config.repetitionPenalty}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.5"
              step="0.05"
              value={config.repetitionPenalty}
              onChange={(e) => setConfig({ ...config, repetitionPenalty: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Penalize recurring token logits</p>
          </div>
        </div>
      )}

      {/* Preset Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Benchmark Prompts
          </span>
          <span className="text-[11px] text-slate-500">
            Click to load test vectors
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p.prompt);
                setTokens([]);
                setSelectedToken(null);
              }}
              className="text-left p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-indigo-400 mb-1 font-mono">
                <span>{p.category}</span>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  {p.tag}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-1 group-hover:text-white">
                {p.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt & Execution Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Prompt Input Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative">
            <label className="block text-xs font-semibold text-slate-400 mb-2 flex justify-between items-center">
              <span>Input Prompt</span>
              <span className="font-mono text-slate-500">
                {promptTokenCount} tokens ({((promptTokenCount / 8192) * 100).toFixed(1)}% of 8K ctx)
              </span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono resize-none"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Terminal className="w-3.5 h-3.5" />
                <span>Format: SentencePiece (131K Vocab)</span>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Halt Generation</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartInference}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Inference (JAX)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Model Output Stream Area */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Model Output Stream
                </span>
                {tokens.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {tokens.length} tokens
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {tokens.length > 0 && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
                {tokens.length > 0 && (
                  <button
                    onClick={() => {
                      setTokens([]);
                      setSelectedToken(null);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Generated Tokens Display */}
            <div className="p-4 min-h-[220px] max-h-[380px] overflow-y-auto bg-slate-950/70 font-mono text-sm leading-relaxed">
              {tokens.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-600 text-xs">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <p>Ready for inference. Click &quot;Run Inference (JAX)&quot; or pick a preset prompt.</p>
                  <p className="text-[10px] text-slate-700 mt-1">Checkpoints loaded from /checkpoints/ckpt-0 (314B)</p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-baseline gap-0.5 select-text">
                    {tokens.map((token, idx) => {
                      const isSelected = selectedToken === token;
                      const primaryExpertId = token.selectedExperts[0]?.expertId ?? 0;
                      const expertMeta = EXPERT_REGISTRY[primaryExpertId];

                      return (
                        <span
                          key={idx}
                          onClick={() => setSelectedToken(token)}
                          className={`cursor-pointer rounded px-0.5 py-0.5 transition-all text-slate-100 ${
                            isSelected
                              ? 'bg-indigo-500/40 ring-1 ring-indigo-400 text-white font-bold'
                              : 'hover:bg-slate-800 hover:text-indigo-200'
                          }`}
                          style={{
                            borderBottom: `2px solid ${expertMeta?.color || '#6366f1'}40`
                          }}
                          title={`Token: "${token.text}" | ID: ${token.id} | Router Top-2: Expert ${token.selectedExperts[0]?.expertId}, Expert ${token.selectedExperts[1]?.expertId}`}
                        >
                          {token.text}
                        </span>
                      );
                    })}
                    {isGenerating && (
                      <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                  <div ref={outputEndRef} />
                </div>
              )}
            </div>

            {/* Token click instruction banner */}
            {tokens.length > 0 && (
              <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>💡 Click any token above to inspect its Token ID, Logprob, and MoE routing gates.</span>
                <span className="font-mono text-indigo-400">Tokens/sec: {metrics.tokensPerSec}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Telemetry & Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Live Gating Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Live MoE Top-2 Gating
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                k=2 of 8 Experts
              </span>
            </div>

            {lastToken ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1 flex justify-between">
                    <span>Active Token</span>
                    <span className="font-mono text-indigo-400">ID: {lastToken.id}</span>
                  </div>
                  <div className="font-mono text-sm text-white font-bold px-2 py-1 bg-slate-900 rounded inline-block">
                    &quot;{lastToken.text}&quot;
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Softmax Router Weights
                  </span>
                  {lastToken.selectedExperts.map((exp, i) => {
                    const expertInfo = EXPERT_REGISTRY[exp.expertId];
                    return (
                      <div key={i} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200">
                            {expertInfo?.name || `Expert ${exp.expertId}`}
                          </span>
                          <span className="font-mono font-bold text-indigo-300">
                            {(exp.weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-200"
                            style={{
                              width: `${exp.weight * 100}%`,
                              backgroundColor: expertInfo?.color || '#6366f1',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {expertInfo?.domain}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-600 text-xs text-center">
                <p>Run generation to see real-time Top-2 expert gate assignments.</p>
              </div>
            )}
          </div>

          {/* Token Deep Inspector (When user clicks a token) */}
          {selectedToken && (
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300">
                  Token Inspector
                </span>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-indigo-900/40">
                  <span className="text-slate-400">Token Text:</span>
                  <span className="text-white font-bold">&quot;{selectedToken.text}&quot;</span>
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-900/40">
                  <span className="text-slate-400">Token ID:</span>
                  <span className="text-indigo-300">{selectedToken.id} / 131,072</span>
                </div>
                <div className="flex justify-between py-1 border-b border-indigo-900/40">
                  <span className="text-slate-400">Log-Prob:</span>
                  <span className="text-emerald-400">{selectedToken.logprob}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-400 block mb-1">Top-2 Routing:</span>
                  {selectedToken.selectedExperts.map((exp, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                      <span>Expert #{exp.expertId}:</span>
                      <span className="font-bold text-cyan-300">{(exp.weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hardware & Inference Performance Metrics */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Runtime Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Generation Speed</span>
                <span className="text-base font-bold text-indigo-400">
                  {metrics.tokensPerSec || '42.0'}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">tok/s</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Time to 1st Token</span>
                <span className="text-base font-bold text-cyan-400">{metrics.ttftMs}</span>
                <span className="text-[10px] text-slate-400 ml-1">ms</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">KV Cache Size</span>
                <span className="text-base font-bold text-amber-400">{metrics.kvCacheMb}</span>
                <span className="text-[10px] text-slate-400 ml-1">MB</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Quantized Memory</span>
                <span className="text-base font-bold text-emerald-400">{metrics.activeVramGb}</span>
                <span className="text-[10px] text-slate-400 ml-1">GB</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mesh Topology:</span>
                <span className="font-mono text-indigo-300">1 host × 8 devices</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Precision:</span>
                <span className="font-mono text-indigo-300">8-bit QW8Bit (Weights)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Context Window:</span>
                <span className="font-mono text-indigo-300">8,192 tokens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
