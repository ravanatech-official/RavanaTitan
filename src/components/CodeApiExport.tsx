import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Download, FileCode, ExternalLink, Shield } from 'lucide-react';

export const CodeApiExport: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const magnetLink = `magnet:?xt=urn:btih:5f96d43576e3d386c9ba65b883210a393b68210e&tr=https%3A%2F%2Facademictorrents.com%2Fannounce.php&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`;

  const bashDownload = `# 1. Download checkpoint weights via HuggingFace CLI
pip install huggingface_hub[hf_transfer]
huggingface-cli download xai-org/grok-1 --repo-type model --include ckpt-0/* --local-dir checkpoints --local-dir-use-symlinks False

# 2. Install dependencies
pip install -r requirements.txt

# 3. Execute inference runner
python run.py`;

  const pythonRunnerCode = `import logging
from model import LanguageModelConfig, TransformerConfig
from runners import InferenceRunner, ModelRunner, sample_from_model

CKPT_PATH = "./checkpoints/"

def main():
    grok_1_model = LanguageModelConfig(
        vocab_size=128 * 1024,
        pad_token=0,
        eos_token=2,
        sequence_len=8192,
        embedding_init_scale=1.0,
        output_multiplier_scale=0.5773502691896257,
        embedding_multiplier_scale=78.38367176906169,
        model=TransformerConfig(
            emb_size=48 * 128,
            widening_factor=8,
            key_size=128,
            num_q_heads=48,
            num_kv_heads=8,
            num_layers=64,
            attn_output_multiplier=0.08838834764831845,
            shard_activations=True,
            num_experts=8,
            num_selected_experts=2,
            data_axis="data",
            model_axis="model",
        ),
    )
    inference_runner = InferenceRunner(
        pad_sizes=(1024,),
        runner=ModelRunner(
            model=grok_1_model,
            bs_per_device=0.125,
            checkpoint_path=CKPT_PATH,
        ),
        name="local",
        load=CKPT_PATH,
        tokenizer_path="./tokenizer.model",
        local_mesh_config=(1, 8),
        between_hosts_config=(1, 1),
    )
    inference_runner.initialize()
    gen = inference_runner.run()

    prompt = "The answer to life the universe and everything is of course"
    print(f"Output for prompt: {prompt}", sample_from_model(gen, prompt, max_len=100, temperature=0.01))

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()`;

  const curlApiCode = `curl https://api.ravanatech.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "titan-314b-moe",
    "messages": [
      {"role": "user", "content": "Explain Rotary Position Embeddings in MoE transformers."}
    ],
    "temperature": 0.01,
    "max_tokens": 150
  }'`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Developer Integration
              </span>
              <span className="text-xs text-slate-400 font-mono">
                JAX &amp; OpenAI-Compatible REST API
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Code &amp; Checkpoint Integration Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Access the original JAX runner script, download checkpoints via Torrent or Hugging Face, and integrate with client SDKs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Apache 2.0 Open Weights
            </span>
          </div>
        </div>
      </div>

      {/* Checkpoint Download Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            1. Downloading the 314B Checkpoint Weights
          </h3>
          <button
            onClick={() => copyToClipboard(magnetLink, 'magnet')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 hover:text-white cursor-pointer"
          >
            {copiedKey === 'magnet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Torrent Magnet</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
          {bashDownload}
        </pre>
      </div>

      {/* JAX Python Runner (run.py) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            2. Native JAX / Haiku Inference Runner (run.py)
          </h3>
          <button
            onClick={() => copyToClipboard(pythonRunnerCode, 'python')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-400 hover:text-white cursor-pointer"
          >
            {copiedKey === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Python Script</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto max-h-[340px] leading-relaxed">
          {pythonRunnerCode}
        </pre>
      </div>

      {/* REST API cURL snippet */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            3. OpenAI-Compatible REST Endpoint (/v1/chat/completions)
          </h3>
          <button
            onClick={() => copyToClipboard(curlApiCode, 'curl')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 hover:text-white cursor-pointer"
          >
            {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy cURL</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto">
          {curlApiCode}
        </pre>
      </div>
    </div>
  );
};
