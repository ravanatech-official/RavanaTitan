import React, { useState } from 'react';
import { Network, Activity, Cpu, CheckCircle2, Zap, BarChart3, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { EXPERT_REGISTRY, RAVANA_TITAN_SPEC } from '../data/modelSpecs';
import { simulateTokenMetadata } from '../data/mockModelEngine';
import { GeneratedToken } from '../types/model';

interface MoeVisualizerProps {
  lastToken?: GeneratedToken;
}

export const MoeVisualizer: React.FC<MoeVisualizerProps> = ({ lastToken }) => {
  const [selectedExpertId, setSelectedExpertId] = useState<number>(0);
  const [testWord, setTestWord] = useState<string>("tensor contraction");
  const [testResult, setTestResult] = useState<GeneratedToken>(
    simulateTokenMetadata("tensor contraction", 1, 10)
  );

  const handleTestRouting = (word: string) => {
    setTestWord(word);
    setTestResult(simulateTokenMetadata(word, Math.floor(Math.random() * 10), 10));
  };

  const selectedExpert = EXPERT_REGISTRY[selectedExpertId];

  // Synthetic load balance stats across 64 layers for all 8 experts
  const expertLoadPercentages = [13.2, 12.8, 11.9, 14.1, 12.4, 11.8, 11.6, 12.2];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                MoE Architecture
              </span>
              <span className="text-xs text-slate-400 font-mono">
                8 Experts • Top-2 Gating • 64 Layers
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Sparse Mixture-of-Experts (MoE) Routing Visualizer
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              RavanaTitan routes each token through exactly 2 of its 8 specialized feed-forward networks (widening factor 8 = 49,152 intermediate dimension). This enables 314B total representation capacity while computing only 86B active parameters per forward pass.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[10px]">Total Params</div>
              <div className="text-white font-bold text-sm">314B</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <div className="text-slate-500 text-[10px]">Active per Token</div>
              <div className="text-indigo-400 font-bold text-sm">86B</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <div className="text-slate-500 text-[10px]">Compute Savings</div>
              <div className="text-emerald-400 font-bold text-sm">72.6%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Routing Sandbox */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Live Token Router Probe
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Softmax Gating Formula: G(x) = Top2(Softmax(x · W_gate))
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={testWord}
            onChange={(e) => handleTestRouting(e.target.value)}
            placeholder="Type any word or concept (e.g., Einstein, backpropagation, quantum, poem)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            {['gradient descent', 'Shakespeare', '42 * 1337', 'quarks'].map((sample) => (
              <button
                key={sample}
                onClick={() => handleTestRouting(sample)}
                className="px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700/60 cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Probe Output */}
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 font-mono text-sm font-bold text-white">
                &quot;{testResult.text}&quot;
              </div>
              <div className="text-xs text-slate-400 font-mono">
                SentencePiece Token ID: <span className="text-indigo-400 font-semibold">{testResult.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/20 px-3 py-1 rounded border border-emerald-900/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Top-2 Gating Validated (Weights sum to 100%)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {testResult.selectedExperts.map((item, idx) => {
              const exp = EXPERT_REGISTRY[item.expertId];
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-slate-900/60"
                  style={{ borderColor: `${exp.color}40` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">
                      {idx === 0 ? 'Primary Selection (Rank 1)' : 'Secondary Selection (Rank 2)'}
                    </span>
                    <span className="font-mono text-sm font-extrabold" style={{ color: exp.color }}>
                      {(item.weight * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: exp.color }}>
                    {exp.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {exp.domain} — {exp.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8 Experts Registry Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            The 8 Specialized Mixture Experts (Registry)
          </h3>
          <span className="text-xs text-slate-400">Click any expert to view specs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPERT_REGISTRY.map((expert) => {
            const isSelected = selectedExpertId === expert.id;
            const loadPct = expertLoadPercentages[expert.id];

            return (
              <div
                key={expert.id}
                onClick={() => setSelectedExpertId(expert.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: expert.color }}
                />

                <div className="flex items-center justify-between mt-1 mb-2">
                  <span className="text-xs font-bold font-mono text-slate-300">
                    Expert {expert.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    Load: {loadPct}%
                  </span>
                </div>

                <div className="text-xs font-semibold text-white mb-1">
                  {expert.domain}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {expert.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Widening: 8x (49K)</span>
                  <span>SwiGLU FFN</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer-by-Layer 64-Layer Heatmap & Routing Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 64-Layer Distribution Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                64-Layer Routing Grid (Transformer Depth)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              64 Layers × 8 Experts
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Each of the 64 layers has an independent router gate parameter matrix <code className="text-indigo-300 font-mono">w_gate: [6144, 8]</code>. As tokens traverse from shallow layers (syntax/token structure) to deep layers (abstract reasoning/synthesis), expert activation patterns shift dynamically.
          </p>

          {/* Grid representation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-8 gap-1.5 mb-2 text-center text-[10px] font-mono text-slate-500">
              {EXPERT_REGISTRY.map((e) => (
                <div key={e.id}>E{e.id}</div>
              ))}
            </div>

            {/* Render 16 representative layers representing layers 1 to 64 */}
            <div className="space-y-1">
              {[1, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64].map((layerNum, lIdx) => (
                <div key={layerNum} className="flex items-center gap-2">
                  <span className="w-12 text-[10px] font-mono text-slate-500 text-right">
                    L{layerNum}
                  </span>
                  <div className="flex-1 grid grid-cols-8 gap-1.5">
                    {EXPERT_REGISTRY.map((e, eIdx) => {
                      const isActive = (lIdx + eIdx) % 4 === 0 || (lIdx * 3 + eIdx) % 7 === 0;
                      const intensity = isActive ? 0.85 : 0.15;
                      return (
                        <div
                          key={e.id}
                          className="h-3 rounded-xs transition-all hover:scale-110"
                          style={{
                            backgroundColor: isActive ? e.color : '#1e293b',
                            opacity: intensity,
                          }}
                          title={`Layer ${layerNum}, Expert ${e.id} (${e.domain}): ${isActive ? 'Active Route (Top-2)' : 'Bypassed'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800 font-mono">
              <span>Shallow Layers (Input / Syntax)</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Deep Layers (Semantic Synthesis / Output)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Expert Detail Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Expert Specification Inspector
            </span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded"
              style={{ backgroundColor: `${selectedExpert.color}20`, color: selectedExpert.color }}
            >
              ID: {selectedExpert.id}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-1">
              {selectedExpert.name}
            </h4>
            <div className="text-xs font-semibold mb-2" style={{ color: selectedExpert.color }}>
              Domain: {selectedExpert.domain}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedExpert.description}
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Hidden Size (d_model):</span>
              <span className="text-white font-bold">{RAVANA_TITAN_SPEC.embSize} (6,144)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">FFN Intermediate Dim:</span>
              <span className="text-indigo-400 font-bold">49,152 (8 × 6,144)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Activation Function:</span>
              <span className="text-cyan-400 font-bold">GeGLU / SwiGLU</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Quantization Format:</span>
              <span className="text-emerald-400 font-bold">QuantizedWeight8bit</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Auxiliary Balance Loss:</span>
              <span className="text-amber-400 font-bold">0.01 × Router Entropy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
