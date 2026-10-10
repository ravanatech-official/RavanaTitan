import React, { useState } from 'react';
import { Server, HardDrive, CheckCircle2, AlertTriangle, Layers, Cpu, Zap, Activity } from 'lucide-react';
import { RAVANA_TITAN_SPEC } from '../data/modelSpecs';

interface HardwareProfile {
  name: string;
  vendor: string;
  deviceCount: number;
  vramPerDeviceGb: number;
  totalVramGb: number;
  memoryBandwidthTb: number;
  interconnect: string;
  recommended: boolean;
}

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    name: "8x NVIDIA H100 SXM5 (80GB)",
    vendor: "NVIDIA",
    deviceCount: 8,
    vramPerDeviceGb: 80,
    totalVramGb: 640,
    memoryBandwidthTb: 3.35,
    interconnect: "NVLink 4.0 (900 GB/s per GPU)",
    recommended: true,
  },
  {
    name: "8x NVIDIA A100 SXM4 (80GB)",
    vendor: "NVIDIA",
    deviceCount: 8,
    vramPerDeviceGb: 80,
    totalVramGb: 640,
    memoryBandwidthTb: 2.04,
    interconnect: "NVLink 3.0 (600 GB/s per GPU)",
    recommended: false,
  },
  {
    name: "4x NVIDIA H200 SXM5 (141GB)",
    vendor: "NVIDIA",
    deviceCount: 4,
    vramPerDeviceGb: 141,
    totalVramGb: 564,
    memoryBandwidthTb: 4.8,
    interconnect: "NVLink 4.0 (900 GB/s per GPU)",
    recommended: false,
  },
  {
    name: "8x NVIDIA H200 SXM5 (141GB)",
    vendor: "NVIDIA",
    deviceCount: 8,
    vramPerDeviceGb: 141,
    totalVramGb: 1128,
    memoryBandwidthTb: 4.8,
    interconnect: "NVLink 4.0 (900 GB/s per GPU)",
    recommended: false,
  },
  {
    name: "8x Google Cloud TPU v5p (95GB)",
    vendor: "Google Cloud",
    deviceCount: 8,
    vramPerDeviceGb: 95,
    totalVramGb: 760,
    memoryBandwidthTb: 4.8,
    interconnect: "ICI 3D Torus (4800 Gbps)",
    recommended: false,
  },
];

export const HardwareCalculator: React.FC = () => {
  const [selectedHardware, setSelectedHardware] = useState<number>(0);
  const [precision, setPrecision] = useState<'int8' | 'bf16' | 'int4'>('int8');
  const [batchSize, setBatchSize] = useState<number>(1);
  const [sequenceLength, setSequenceLength] = useState<number>(4096);

  const hw = HARDWARE_PROFILES[selectedHardware];

  // Weight Memory calculation
  const weightGb = precision === 'bf16' ? 628 : precision === 'int8' ? 314 : 157;

  // KV cache memory: 2 * num_layers * num_kv_heads * head_dim * seq_len * batch_size * bytes_per_element
  // num_layers = 64, num_kv_heads = 8, head_dim = 128
  const bytesPerKvElement = precision === 'bf16' ? 2 : 1;
  const kvCacheBytes = 2 * 64 * 8 * 128 * sequenceLength * batchSize * bytesPerKvElement;
  const kvCacheGb = parseFloat((kvCacheBytes / (1024 * 1024 * 1024)).toFixed(2));

  // Activation & framework buffer memory
  const activationGb = parseFloat((4.5 * (sequenceLength / 4096) * batchSize).toFixed(1));
  const frameworkOverheadGb = 16.0;

  const totalRequiredVramGb = parseFloat((weightGb + kvCacheGb + activationGb + frameworkOverheadGb).toFixed(1));
  const fitsInMemory = totalRequiredVramGb <= hw.totalVramGb;
  const headroomGb = parseFloat((hw.totalVramGb - totalRequiredVramGb).toFixed(1));

  // Estimated tokens per second (active weights = 86B)
  const activeParamsBytes = (86 * 1e9 * (precision === 'bf16' ? 2 : 1));
  const aggregateBandwidth = hw.deviceCount * (hw.memoryBandwidthTb * 1e12);
  const theoreticalTokensPerSec = Math.min(120, Math.max(15, Math.floor((aggregateBandwidth / activeParamsBytes) * 0.45)));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Cluster Sizing Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Mesh Topology: local_mesh_config=(1, 8)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              VRAM Sizing &amp; Distributed Mesh Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Calculate exact VRAM footprints, KV cache allocation, and inference speeds across GPU clusters to serve the 314-billion parameter RavanaTitan MoE model.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold font-mono ${
              fitsInMemory
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {fitsInMemory ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              <span>{fitsInMemory ? `FITS IN VRAM (+${headroomGb} GB FREE)` : `OUT OF MEMORY (DEFICIT ${Math.abs(headroomGb)} GB)`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Hardware Selection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Target Hardware Cluster
          </label>
          <div className="space-y-2">
            {HARDWARE_PROFILES.map((profile, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedHardware(idx)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                  selectedHardware === idx
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <span>{profile.name}</span>
                    {profile.recommended && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                        Official Spec
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {profile.interconnect}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-cyan-400">
                  {profile.totalVramGb} GB
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Precision & Parameters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4 md:col-span-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Weight Precision
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => setPrecision('int8')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                  precision === 'int8'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>INT8 (QW8Bit)</div>
                <div className="text-[10px] text-indigo-400 mt-0.5">314 GB</div>
              </button>
              <button
                onClick={() => setPrecision('bf16')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                  precision === 'bf16'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>BF16 (Native)</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">628 GB</div>
              </button>
              <button
                onClick={() => setPrecision('int4')}
                className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                  precision === 'int4'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>INT4 (AWQ)</div>
                <div className="text-[10px] text-amber-400 mt-0.5">157 GB</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              *The official checkpoint releases weights in 8-bit quantization (QuantizedWeight8bit).
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Concurrent Batch Size: {batchSize}</span>
                <span className="text-indigo-400 font-bold">{batchSize} sequences</span>
              </div>
              <input
                type="range"
                min="1"
                max="32"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Sequence Length: {sequenceLength}</span>
                <span className="text-cyan-400 font-bold">{sequenceLength} tokens</span>
              </div>
              <input
                type="range"
                min="512"
                max="8192"
                step="512"
                value={sequenceLength}
                onChange={(e) => setSequenceLength(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Memory Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Model Weights VRAM</span>
          <span className="text-xl font-bold text-white">{weightGb} GB</span>
          <span className="text-[10px] text-slate-400 block mt-1">314B parameters ({precision.toUpperCase()})</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 block">KV Cache VRAM</span>
          <span className="text-xl font-bold text-cyan-400">{kvCacheGb} GB</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            64L × 8 KV-heads × {sequenceLength} ctx × {batchSize} batch
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Total Required VRAM</span>
          <span className={`text-xl font-bold ${fitsInMemory ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRequiredVramGb} GB
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Includes activations &amp; buffers</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Theoretical Throughput</span>
          <span className="text-xl font-bold text-indigo-400">~{theoreticalTokensPerSec} tok/s</span>
          <span className="text-[10px] text-slate-400 block mt-1">Memory bandwidth limited</span>
        </div>
      </div>

      {/* Distributed Mesh Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          JAX Sharding Topology for RavanaTitan
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          To run inference, JAX defines a 2-dimensional device mesh using <code className="text-indigo-300 font-mono">jax.sharding.Mesh</code>:
        </p>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          <div><span className="text-slate-500"># Configured in run.py:</span></div>
          <div><span className="text-indigo-400">local_mesh_config</span> = (1, 8)  <span className="text-slate-500"># 1 host × 8 devices</span></div>
          <div><span className="text-indigo-400">between_hosts_config</span> = (1, 1)  <span className="text-slate-500"># Single multi-GPU host</span></div>
          <div><span className="text-indigo-400">data_axis</span> = &quot;data&quot;</div>
          <div><span className="text-indigo-400">model_axis</span> = &quot;model&quot;  <span className="text-slate-500"># Shards each expert tensor across the 8 GPUs</span></div>
        </div>
      </div>
    </div>
  );
};
