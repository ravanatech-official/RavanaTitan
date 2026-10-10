import React, { useState } from 'react';
import { Database, Search, Hash, Split, Layers, Sparkles, Copy, Check } from 'lucide-react';
import { tokenizeText } from '../data/mockModelEngine';
import { RAVANA_TITAN_SPEC } from '../data/modelSpecs';

export const TokenizerStudio: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    "The answer to life the universe and everything is of course 42. In RavanaTitan, the SentencePiece tokenizer spans 131,072 vocabulary IDs."
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const { tokens, tokenIds } = tokenizeText(inputText);

  // Colors for alternate tokens
  const tokenColors = [
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'bg-pink-500/20 text-pink-300 border-pink-500/40',
    'bg-purple-500/20 text-purple-300 border-purple-500/40',
  ];

  const compressionRatio = inputText.length > 0 && tokens.length > 0
    ? (inputText.length / tokens.length).toFixed(2)
    : '0.00';

  const contextPercent = ((tokens.length / RAVANA_TITAN_SPEC.contextLength) * 100).toFixed(2);

  const copyTokenIds = () => {
    navigator.clipboard.writeText(JSON.stringify(tokenIds));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                SentencePiece Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Vocab Size: 131,072 (128 × 1024)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              SentencePiece Tokenizer &amp; Subword Segmentation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Inspect how RavanaTitan converts raw text into subword tokens according to its SentencePiece BPE vocabulary model (<code className="text-emerald-400 font-mono">tokenizer.model</code>). Observe whitespace prefixes, character compression, and token ID assignments.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[10px]">Vocab Size</div>
              <div className="text-emerald-400 font-bold text-sm">131,072</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <div className="text-slate-500 text-[10px]">Context Limit</div>
              <div className="text-white font-bold text-sm">8,192 tok</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <label className="block text-xs font-semibold text-slate-400 mb-2 flex justify-between items-center">
          <span>Input Text to Tokenize</span>
          <span className="font-mono text-slate-500">
            {inputText.length} characters • {tokens.length} tokens
          </span>
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type text to inspect token boundaries..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 resize-none"
        />

        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "The answer to life the universe and everything is of course",
            "jax.pmap(lambda x: jax.lax.all_gather(x, axis_name='i'))",
            "SentencePiece 131,072 vocabulary representation with RoPE",
          ].map((sample, i) => (
            <button
              key={i}
              onClick={() => setInputText(sample)}
              className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              Preset {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Total Tokens</span>
          <span className="text-base font-bold text-emerald-400">{tokens.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">subword units</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Chars per Token</span>
          <span className="text-base font-bold text-cyan-400">{compressionRatio}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">compression factor</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Context Window</span>
          <span className="text-base font-bold text-indigo-400">{contextPercent}%</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">of 8,192 capacity</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Vocab Coverage</span>
          <span className="text-base font-bold text-amber-400">131K</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">BPE token IDs</span>
        </div>
      </div>

      {/* Color-Coded Token Segment Visualization */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Split className="w-4 h-4 text-emerald-400" />
            Tokenized Representation (Colored Boundaries)
          </h3>
          <button
            onClick={copyTokenIds}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied IDs' : 'Copy Token IDs'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed flex flex-wrap gap-1.5 min-h-[100px]">
          {tokens.map((token, idx) => {
            const colorClass = tokenColors[idx % tokenColors.length];
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${colorClass} hover:opacity-100 transition`}
                title={`Index: ${idx} | Token: "${token}" | ID: ${tokenIds[idx]}`}
              >
                <span>{token.replace(' ', ' ')}</span>
                <span className="text-[9px] opacity-60 font-semibold">#{tokenIds[idx]}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Token ID List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono">
            Detailed Token Mapping Table
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Showing first {Math.min(tokens.length, 30)} tokens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Index</th>
                <th className="py-2.5 px-4">Token String</th>
                <th className="py-2.5 px-4">Vocab Token ID</th>
                <th className="py-2.5 px-4">Length</th>
                <th className="py-2.5 px-4">Special Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tokens.slice(0, 30).map((tok, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-4 text-slate-500">[{i}]</td>
                  <td className="py-2 px-4 font-bold text-white">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      &quot;{tok}&quot;
                    </span>
                  </td>
                  <td className="py-2 px-4 text-emerald-400 font-semibold">{tokenIds[i]}</td>
                  <td className="py-2 px-4 text-slate-400">{tok.length} chars</td>
                  <td className="py-2 px-4 text-slate-500">
                    {tokenIds[i] === 0 ? '<pad>' : tokenIds[i] === 2 ? '<eos>' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
