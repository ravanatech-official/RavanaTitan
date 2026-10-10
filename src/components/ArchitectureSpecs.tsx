import React, { useState } from 'react';
import { Cpu, Layers, GitBranch, Binary, ShieldCheck, Box, ChevronRight, Copy, Check } from 'lucide-react';
import { RAVANA_TITAN_SPEC } from '../data/modelSpecs';

export const ArchitectureSpecs: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'shapes' | 'jax_source'>('overview');

  const copyConfigCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jaxConfigSnippet = `# LanguageModelConfig & TransformerConfig (from run.py & model.py)
grok_1_model = LanguageModelConfig(
    vocab_size=128 * 1024,                  # 131,072 tokens
    pad_token=0,
    eos_token=2,
    sequence_len=8192,                      # 8K Context Window
    embedding_init_scale=1.0,
    output_multiplier_scale=0.5773502691896257,
    embedding_multiplier_scale=78.38367176906169,
    model=TransformerConfig(
        emb_size=48 * 128,                  # 6,144 embedding dim
        widening_factor=8,                  # FFN intermediate = 49,152
        key_size=128,                       # Head dimension
        num_q_heads=48,                     # 48 Query Heads
        num_kv_heads=8,                     # 8 Key/Value Heads (MQA/GQA)
        num_layers=64,                      # 64 Transformer Blocks
        attn_output_multiplier=0.08838834764831845,
        shard_activations=True,
        # MoE Architecture:
        num_experts=8,                      # 8 Experts per layer
        num_selected_experts=2,             # Top-2 routing per token
        # Activation and weight sharding across 2D device mesh:
        data_axis="data",
        model_axis="model",
    ),
)`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Technical Specification
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Grok-1 / RavanaTitan Foundation Architecture
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              314-Billion Parameter Transformer Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              An autoregressive sparse mixture-of-experts transformer trained by xAI and incorporated into RavanaTitan. Combines rotary positional embeddings (RoPE), multi-query attention, 8-expert sparse layers, and 8-bit quantized weights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Specs Sheet
            </button>
            <button
              onClick={() => setActiveTab('shapes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                activeTab === 'shapes'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Tensor Pipelines
            </button>
            <button
              onClick={() => setActiveTab('jax_source')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                activeTab === 'jax_source'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              JAX Config
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Core Dimensions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Cpu className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Parameter Scaling
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Weights:</span>
                <span className="text-white font-bold">314 Billion (314B)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Active per Token:</span>
                <span className="text-indigo-400 font-bold">86 Billion (25.7%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Layers (Depth):</span>
                <span className="text-white font-bold">{RAVANA_TITAN_SPEC.layers} Transformer Blocks</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Hidden Dim (d_model):</span>
                <span className="text-white font-bold">{RAVANA_TITAN_SPEC.embSize} (48 × 128)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Context Window:</span>
                <span className="text-cyan-400 font-bold">{RAVANA_TITAN_SPEC.contextLength} Tokens</span>
              </div>
            </div>
          </div>

          {/* Card 2: Attention & Multi-Query */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Layers className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Attention Mechanism
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Query Heads (num_q_heads):</span>
                <span className="text-white font-bold">{RAVANA_TITAN_SPEC.qHeads} Heads</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">KV Heads (num_kv_heads):</span>
                <span className="text-cyan-400 font-bold">{RAVANA_TITAN_SPEC.kvHeads} Heads (MQA/GQA)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Head Dimension (key_size):</span>
                <span className="text-white font-bold">{RAVANA_TITAN_SPEC.keySize} dims</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Positional Encoding:</span>
                <span className="text-emerald-400 font-bold">RoPE (Rotary Embeddings)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Attn Output Multiplier:</span>
                <span className="text-white font-bold">0.08838834...</span>
              </div>
            </div>
          </div>

          {/* Card 3: Mixture of Experts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <GitBranch className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                MoE Feed-Forward Layer
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Experts:</span>
                <span className="text-white font-bold">{RAVANA_TITAN_SPEC.numExperts} Experts / layer</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Selected Experts:</span>
                <span className="text-amber-400 font-bold">Top-2 per token</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Widening Factor:</span>
                <span className="text-white font-bold">8× (49,152 dims)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gating Mechanism:</span>
                <span className="text-white font-bold">Learned Softmax Router</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Load Balancing Loss:</span>
                <span className="text-emerald-400 font-bold">Auxiliary Entropy Gating</span>
              </div>
            </div>
          </div>

          {/* Card 4: Tokenizer & Vocabulary */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Binary className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tokenizer &amp; Embedding
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Tokenizer Format:</span>
                <span className="text-white font-bold">SentencePiece (BPE)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Vocabulary Size:</span>
                <span className="text-emerald-400 font-bold">131,072 (128 × 1024)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Special Tokens:</span>
                <span className="text-white font-bold">&lt;pad&gt;=0, &lt;eos&gt;=2</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Embedding Multiplier:</span>
                <span className="text-white font-bold">78.38367...</span>
              </div>
            </div>
          </div>

          {/* Card 5: Precision & Quantization */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Quantization &amp; Stability
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Weight Quantization:</span>
                <span className="text-rose-400 font-bold">8-bit QuantizedWeight8bit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Quantized Weight Size:</span>
                <span className="text-white font-bold">~314 GB (fits 8x H100)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Unquantized BF16 Size:</span>
                <span className="text-slate-500 font-bold">~628 GB</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Normalization:</span>
                <span className="text-white font-bold">RMSNorm (pre-norm)</span>
              </div>
            </div>
          </div>

          {/* Card 6: Distributed JAX Mesh */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Box className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Distributed Parallelism
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Local Mesh Config:</span>
                <span className="text-purple-400 font-bold">(1, 8) — 8 GPUs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Between Hosts Config:</span>
                <span className="text-white font-bold">(1, 1) — Single Node</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Activation Sharding:</span>
                <span className="text-emerald-400 font-bold">Enabled (data_axis)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Model Sharding:</span>
                <span className="text-white font-bold">Tensor Axis (model_axis)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shapes' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">
            End-to-End Forward Pass Computation Graph
          </h3>
          <p className="text-xs text-slate-400">
            Traces tensor transformations for batch size <code className="text-indigo-400 font-mono">B</code> and sequence length <code className="text-cyan-400 font-mono">S ≤ 8192</code> through the 64-layer pipeline.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 1: TOKENIZATION &amp; EMBEDDING</span>
                <span className="text-slate-200 font-bold">Tokens [B, S] → Embedding Lookup [B, S, 6144]</span>
              </div>
              <span className="text-indigo-400 text-[11px] bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900">
                Scaled by 78.38
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 2: ROTARY POSITION EMBEDDING (RoPE)</span>
                <span className="text-slate-200 font-bold">Q [B, S, 48, 128], K [B, S, 8, 128] rotated in 2D coordinate sub-planes</span>
              </div>
              <span className="text-cyan-400 text-[11px] bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-900">
                Preserves relative distance
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 3: MULTI-QUERY ATTENTION (MQA)</span>
                <span className="text-slate-200 font-bold">Attention Scores = Softmax((Q × K^T) / √128 × 0.088) × V</span>
              </div>
              <span className="text-emerald-400 text-[11px] bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900">
                Attn Output [B, S, 6144]
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 4: SPARSE ROUTER DISPATCH</span>
                <span className="text-slate-200 font-bold">Logits = Matmul(X, W_gate [6144, 8]); Top2 = TopK(Softmax(Logits), 2)</span>
              </div>
              <span className="text-amber-400 text-[11px] bg-amber-950/40 px-2.5 py-1 rounded border border-amber-900">
                Routes to 2 of 8 Experts
              </span>
            </div>

            {/* Step 5 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 5: PARALLEL EXPERT FFN EVALUATION</span>
                <span className="text-slate-200 font-bold">SwiGLU: [B, S, 6144] → Intermediate [B, S, 49152] → [B, S, 6144]</span>
              </div>
              <span className="text-purple-400 text-[11px] bg-purple-950/40 px-2.5 py-1 rounded border border-purple-900">
                Widening Factor: 8×
              </span>
            </div>

            {/* Step 6 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">STEP 6: UNEMBEDDING &amp; VOCABULARY PROJECTION</span>
                <span className="text-slate-200 font-bold">Output Logits = Matmul(RMSNorm(X), W_vocab [6144, 131072]) × 0.577</span>
              </div>
              <span className="text-rose-400 text-[11px] bg-rose-950/40 px-2.5 py-1 rounded border border-rose-900">
                Logits [B, S, 131072]
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jax_source' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400">
              run.py &amp; model.py configuration definitions
            </span>
            <button
              onClick={() => copyConfigCode(jaxConfigSnippet)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
            {jaxConfigSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
