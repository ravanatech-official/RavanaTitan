import React, { useState, useEffect } from 'react';
import { 
  X, Key, Cpu, Check, Sparkles, Globe, Loader2, AlertCircle, 
  Zap, HardDrive, Laptop, ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  checkWebGpuSupport, WebGpuDeviceInfo, POPULAR_WEBLLM_MODELS, 
  initWebLlmEngine, unloadWebLlmEngine, isWebLlmReady, getActiveWebLlmModelId 
} from '../lib/webLlmService';
import { FREE_HF_MODELS } from '../lib/hfInferenceService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'webgpu' | 'hf' | 'gemini' | 'laptop'>('webgpu');
  const [apiKey, setApiKey] = useState<string>('');
  const [hfToken, setHfToken] = useState<string>('');
  const [selectedWebLlmModel, setSelectedWebLlmModel] = useState<string>('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const [selectedHfModel, setSelectedHfModel] = useState<string>('Qwen/Qwen2.5-72B-Instruct');

  // WebGPU hardware state
  const [gpuInfo, setGpuInfo] = useState<WebGpuDeviceInfo | null>(null);
  const [checkingGpu, setCheckingGpu] = useState<boolean>(true);
  const [preloadingModel, setPreloadingModel] = useState<boolean>(false);
  const [preloadProgress, setPreloadProgress] = useState<string>('');
  const [isEngineReady, setIsEngineReady] = useState<boolean>(false);

  // Gemini test state
  const [testingGemini, setTestingGemini] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const existingGemini = localStorage.getItem('GEMINI_API_KEY') || '';
      const existingHf = localStorage.getItem('HF_ACCESS_TOKEN') || '';
      const savedWebModel = localStorage.getItem('WEBLLM_DEFAULT_MODEL') || 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
      const savedHfModel = localStorage.getItem('HF_DEFAULT_MODEL') || 'Qwen/Qwen2.5-72B-Instruct';

      setApiKey(existingGemini);
      setHfToken(existingHf);
      setSelectedWebLlmModel(savedWebModel);
      setSelectedHfModel(savedHfModel);
      setIsEngineReady(isWebLlmReady());

      // Inspect WebGPU hardware
      setCheckingGpu(true);
      checkWebGpuSupport()
        .then((info) => setGpuInfo(info))
        .finally(() => setCheckingGpu(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreloadWebLlm = async () => {
    setPreloadingModel(true);
    setPreloadProgress('Initializing WebGPU shader compiler...');
    try {
      await initWebLlmEngine(selectedWebLlmModel, (report) => {
        const pct = Math.round((report.progress || 0) * 100);
        setPreloadProgress(`${report.text} (${pct}%)`);
      });
      setIsEngineReady(true);
      setPreloadProgress('Model compiled & ready in GPU memory!');
    } catch (err: any) {
      setPreloadProgress(`Error: ${err?.message || 'Failed to initialize WebGPU model'}`);
    } finally {
      setPreloadingModel(false);
    }
  };

  const handleUnloadWebLlm = async () => {
    await unloadWebLlmEngine();
    setIsEngineReady(false);
    setPreloadProgress('');
  };

  const handleTestGeminiKey = async () => {
    if (!apiKey.trim()) {
      setGeminiResult({ success: false, msg: 'Please enter a Gemini API key to test' });
      return;
    }
    setTestingGemini(true);
    setGeminiResult(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (res.ok) {
        setGeminiResult({ success: true, msg: 'API Key active! Connected directly to Google Generative AI.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setGeminiResult({ success: false, msg: err?.error?.message || 'Invalid API Key' });
      }
    } catch (e: any) {
      setGeminiResult({ success: false, msg: e?.message || 'Network error while validating key' });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSaveAll = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      } else {
        localStorage.removeItem('GEMINI_API_KEY');
      }

      if (hfToken.trim()) {
        localStorage.setItem('HF_ACCESS_TOKEN', hfToken.trim());
      } else {
        localStorage.removeItem('HF_ACCESS_TOKEN');
      }

      localStorage.setItem('WEBLLM_DEFAULT_MODEL', selectedWebLlmModel);
      localStorage.setItem('HF_DEFAULT_MODEL', selectedHfModel);

      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#18181e] border border-[#2b2b35] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-zinc-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262630] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-xs font-mono shadow-sm">
              RT
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Engine &amp; Hardware Hub
              </h3>
              <p className="text-[11px] text-zinc-400">
                100% Zero-Cost In-Browser WebGPU &amp; Serverless Inference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121216] border border-[#22222a] text-xs">
          <button
            onClick={() => setActiveTab('webgpu')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'webgpu'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>WebGPU (Local)</span>
          </button>

          <button
            onClick={() => setActiveTab('hf')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'hf'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            <span>Hugging Face</span>
          </button>

          <button
            onClick={() => setActiveTab('laptop')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'laptop'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-500" />
            <span>Laptop Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'gemini'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>API Keys</span>
          </button>
        </div>

        {/* TAB 1: WEBGPU IN-BROWSER */}
        {activeTab === 'webgpu' && (
          <div className="space-y-4">
            {/* Hardware Status Card */}
            <div className="p-3.5 rounded-2xl bg-[#121216] border border-[#252530] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hardware WebGPU Status:</span>
                </span>
                {checkingGpu ? (
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : gpuInfo?.supported ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-mono font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Supported &amp; Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 text-[11px] font-mono">
                    Not Detected
                  </span>
                )}
              </div>

              {gpuInfo?.supported && (
                <div className="pt-1 text-[11px] text-zinc-300 font-mono space-y-0.5">
                  <div className="truncate text-zinc-400">
                    Adapter: <span className="text-white font-medium">{gpuInfo.adapterName}</span>
                  </div>
                  <div className="text-zinc-400">
                    Vendor: <span className="text-sky-400">{gpuInfo.vendor}</span> ({gpuInfo.architecture})
                  </div>
                </div>
              )}

              {!gpuInfo?.supported && !checkingGpu && (
                <p className="text-[11px] text-amber-300/90 leading-relaxed pt-1">
                  💡 WebGPU isn&apos;t active in this browser tab. Use Google Chrome, Brave, or Edge (v113+) and enable &quot;Use hardware acceleration when available&quot; in browser settings.
                </p>
              )}
            </div>

            {/* In-Browser Model Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                In-Browser WebGPU Model (0 API Keys, 100% Free &amp; Private)
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {POPULAR_WEBLLM_MODELS.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedWebLlmModel(m.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      selectedWebLlmModel === m.id
                        ? 'bg-[#1e1e28] border-sky-500 text-white shadow-sm'
                        : 'bg-[#121216] border-[#22222a] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.recommended && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            Fastest
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{m.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono pt-1">
                        <span>Size: {m.size}</span>
                        <span>RAM/VRAM: {m.vramReq}</span>
                      </div>
                    </div>
                    {selectedWebLlmModel === m.id && (
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preload / Cache Engine Button */}
            <div className="p-3 rounded-2xl bg-[#121216] border border-[#22222a] flex items-center justify-between">
              <div className="text-xs">
                <span className="text-white font-medium block">Browser GPU VRAM Cache</span>
                <span className="text-[11px] text-zinc-400">
                  {isEngineReady 
                    ? `Active in memory (${getActiveWebLlmModelId()})` 
                    : 'Download once into browser cache, then runs offline.'}
                </span>
              </div>
              {isEngineReady ? (
                <button
                  onClick={handleUnloadWebLlm}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  Unload VRAM
                </button>
              ) : (
                <button
                  onClick={handlePreloadWebLlm}
                  disabled={preloadingModel || !gpuInfo?.supported}
                  className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                >
                  {preloadingModel && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{preloadingModel ? 'Compiling...' : 'Preload Model'}</span>
                </button>
              )}
            </div>

            {preloadProgress && (
              <div className="text-xs font-mono text-sky-400 bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/60 animate-pulse">
                {preloadProgress}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HUGGING FACE FREE SERVERLESS */}
        {activeTab === 'hf' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#121216] border border-[#22222a] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Hugging Face Free Serverless Inference</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connects to open-weight models hosted on Hugging Face Serverless infrastructure. Completely zero cost with no server bills!
              </p>
            </div>

            {/* HF Model Select */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 block">Select Open Foundation Model</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {FREE_HF_MODELS.map((hf) => (
                  <div
                    key={hf.id}
                    onClick={() => setSelectedHfModel(hf.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedHfModel === hf.id
                        ? 'bg-[#1e1e28] border-sky-500 text-white'
                        : 'bg-[#121216] border-[#22222a] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{hf.name}</div>
                      <div className="text-[11px] text-zinc-400 leading-snug">{hf.description}</div>
                      <div className="text-[10px] text-zinc-500 font-mono pt-0.5">{hf.context}</div>
                    </div>
                    {selectedHfModel === hf.id && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Optional HF Token */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 flex items-center justify-between">
                <span>Free Hugging Face Access Token (Optional)</span>
                <span className="text-[10px] text-zinc-500 font-mono">hf_...</span>
              </label>
              <p className="text-[11px] text-zinc-400">
                Adding your free Hugging Face User Access Token gives you higher rate limits with zero payments.
              </p>
              <input
                type="password"
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#121216] border border-[#2b2b35] rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: LAPTOP ACCELERATION GUIDE */}
        {activeTab === 'laptop' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#121216] border border-[#22222a] space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-emerald-400" />
                Laptop Super-Run Configuration (100% Free)
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Follow these 4 tips so your laptop runs WebGPU and unrestricted AI at peak speeds:
              </p>
            </div>

            <div className="space-y-2 text-zinc-300 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Turn ON Hardware Acceleration in Browser</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  In Chrome / Brave / Edge: Go to <code>Settings &gt; System &gt; &quot;Use hardware acceleration when available&quot;</code> &rarr; Turn ON &amp; Relaunch.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Keep Laptop Plugged In (AC Power)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Laptops throttle GPU clocks on battery by up to 60%. Plug in your power adapter for full GPU memory bandwidth!
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Windows Dedicated GPU Assignment</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  If you have NVIDIA / AMD GPU: Windows Settings &gt; System &gt; Display &gt; Graphics &gt; Add Google Chrome &gt; Set to <strong>&quot;High Performance&quot; (NVIDIA GPU)</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Zero Restriction / Uncensored Chat &amp; Vision</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  In the chat model picker, choose <strong>WebGPU Local ⚡</strong> or <strong>Hugging Face Free 🌐</strong>. For images, type <code>/imagine [prompt]</code> for 100% free Flux generations!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: API KEYS */}
        {activeTab === 'gemini' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#121216] border border-[#22222a] space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Google AI Studio API Key (Optional)
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Gemini 2.5/3.8 provides an official free tier (up to 15 RPM) at Google AI Studio. Adding it here runs cloud inference directly from your browser.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setGeminiResult(null);
                }}
                placeholder="AIzaSy..."
                className="flex-1 bg-[#121216] border border-[#2b2b35] rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleTestGeminiKey}
                disabled={testingGemini || !apiKey.trim()}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                {testingGemini ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test Key'}
              </button>
            </div>

            {geminiResult && (
              <div className={`p-2.5 rounded-xl flex items-center gap-2 ${
                geminiResult.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
              }`}>
                {geminiResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{geminiResult.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between border-t border-[#262630] pt-3">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Third-Party Billing &bull; 100% Free</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5 text-sky-600" />}
              <span>{savedNotice ? 'Saved!' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
