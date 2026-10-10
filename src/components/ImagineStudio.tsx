import React, { useState } from 'react';
import { Sparkles, Download, Copy, Check, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';

interface ImagineStudioProps {
  onBack: () => void;
}

interface ImageItem {
  id: number | string;
  title: string;
  prompt: string;
  url: string;
  aspect: string;
  isNew?: boolean;
}

const INITIAL_GALLERY: ImageItem[] = [
  {
    id: 'p1',
    title: "SpaceX Raptor 3 Rocket Engine",
    prompt: "A high-precision engineering photograph of SpaceX Raptor 3 rocket engine in a clean test bay, exposed regenerative 3D printed nozzles, cinematic aerospace lighting, 8k resolution.",
    url: "https://images.unsplash.com/photo-1517976487548-c2b64d370125?q=80&w=1000&auto=format&fit=crop",
    aspect: "16:9",
  },
  {
    id: 'p2',
    title: "RavanaTitan 314B Neural Cluster",
    prompt: "A massive futuristic AI supercomputing cluster, glowing liquid-cooled optical interconnects, deep obsidian servers, blue and cyan neon illumination, ultra-realistic.",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
    aspect: "16:9",
  },
  {
    id: 'p3',
    title: "Mixture-of-Experts Tensor Topology",
    prompt: "Abstract 3D scientific visualization of 8 interconnected mathematical experts routing multidimensional data streams, crystalline nodes, raytraced glass and silver.",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    aspect: "1:1",
  },
];

export const ImagineStudio: React.FC<ImagineStudioProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState<string>('SpaceX Raptor 3 aerospace rocket engine firing at 350 bar chamber pressure, photorealistic, 8k');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aspect, setAspect] = useState<string>('16:9');
  const [gallery, setGallery] = useState<ImageItem[]>(INITIAL_GALLERY);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);

    let width = 1280;
    let height = 720;
    if (aspect === '1:1') {
      width = 1024;
      height = 1024;
    } else if (aspect === '9:16') {
      width = 720;
      height = 1280;
    }

    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(trimmed)}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;

    // Preload image in memory
    try {
      await new Promise((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = resolve;
        img.onerror = resolve; // Continue on fallback
        // Timeout safety
        setTimeout(resolve, 4000);
      });
    } catch {
      // Ignore
    }

    const newItem: ImageItem = {
      id: `gen-${Date.now()}`,
      title: trimmed.slice(0, 32) + (trimmed.length > 32 ? '...' : ''),
      prompt: trimmed,
      url: imageUrl,
      aspect,
      isNew: true,
    };

    setGallery((prev) => [newItem, ...prev]);
    setIsGenerating(false);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `${filename.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131316] text-[#e4e4e7] overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1c22] border border-[#2b2b35] text-xs text-[#a1a1aa] hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chat</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Imagine Studio</span>
          </h2>
        </div>
        <div className="text-xs font-mono text-[#a1a1aa]">
          Flux-MoE Vision • <span className="text-emerald-400">100% Free &amp; Uncensored</span>
        </div>
      </div>

      {/* Main Prompt Bar */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-[#1c1c22] border border-[#2b2b35] rounded-3xl p-4 shadow-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to imagine..."
            rows={2}
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-[#71717a] resize-none leading-relaxed px-1"
          />

          <div className="flex items-center justify-between pt-3 border-t border-[#262630] mt-2">
            <div className="flex items-center gap-2">
              {['16:9', '1:1', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspect(ratio)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
                    aspect === ratio
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isGenerating ? 'Rendering High-Res...' : 'Imagine'}</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3">
            Recent Visualizations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="group bg-[#1c1c22] border border-[#2b2b35] rounded-2xl overflow-hidden hover:border-white/20 transition flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
                    {img.aspect}
                  </div>
                  {img.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                      NEW
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{img.title}</h4>
                    <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-snug">{img.prompt}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262630] text-xs text-[#71717a]">
                    <span className="font-mono text-[10px]">RavanaTitan Vision</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(img.prompt);
                          setCopiedId(img.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1 rounded hover:text-white transition cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(img.url, img.title)}
                        className="p-1 rounded hover:text-white transition cursor-pointer"
                        title="Open/Download Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
