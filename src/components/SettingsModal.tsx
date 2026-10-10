import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Check, ShieldCheck, Sparkles, Globe, Loader2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(existing);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, msg: 'Please enter an API key to test' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (res.ok) {
        setTestResult({ success: true, msg: 'Key valid! Live Gemini 2.5 Flash connected.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({ success: false, msg: err?.error?.message || 'Invalid API Key' });
      }
    } catch (e: any) {
      setTestResult({ success: false, msg: e?.message || 'Network error while validating key' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      } else {
        localStorage.removeItem('GEMINI_API_KEY');
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#18181e] border border-[#2b2b35] rounded-3xl p-6 shadow-2xl space-y-5 text-zinc-100">
        <div className="flex items-center justify-between border-b border-[#262630] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              RavanaTitan Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Specs */}
        <div className="p-3.5 rounded-2xl bg-[#121216] border border-[#22222a] text-xs font-mono space-y-2">
          <div className="flex justify-between text-zinc-400">
            <span>Model Engine:</span>
            <span className="text-white font-bold">RavanaTitan-314B-MoE</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Sinhala &amp; Singlish:</span>
            <span className="text-emerald-400 font-bold">Native Fluent (100%)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Vision &amp; Image Studio:</span>
            <span className="text-amber-400 font-bold">Flux-MoE (Free / Uncensored)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Web Search Grounding:</span>
            <span className="text-sky-400 font-bold">Live Wikipedia Knowledge</span>
          </div>
        </div>

        {/* Optional Live AI API Key */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Google AI Studio API Key (Optional)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Free at Google AI</span>
          </label>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            On static Firebase Hosting, adding your free Google AI Studio key unlocks direct, unlimited live internet generative AI with zero server dependencies.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="flex-1 bg-[#121216] border border-[#2b2b35] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleTestKey}
              disabled={testing || !apiKey.trim()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition cursor-pointer disabled:opacity-40 flex items-center gap-1"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
            </button>
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5 text-sky-600" />}
            <span>{saved ? 'Saved!' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
