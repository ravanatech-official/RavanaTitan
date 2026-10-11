/**
 * In-Browser WebGPU LLM Engine using @mlc-ai/web-llm
 * 100% Client-Side, 0 API Keys, 0 Server Cost, 100% Free & Unrestricted
 */
import { MLCEngine, CreateMLCEngine, InitProgressReport } from '@mlc-ai/web-llm';

export interface WebGpuDeviceInfo {
  supported: boolean;
  adapterName?: string;
  vendor?: string;
  architecture?: string;
  error?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  size: string;
  vramReq: string;
  recommended: boolean;
  description: string;
}

export const POPULAR_WEBLLM_MODELS: ModelOption[] = [
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 1B Instruct (Ultra Fast)',
    size: '~870 MB',
    vramReq: '1.5 GB VRAM / RAM',
    recommended: true,
    description: 'Fastest in-browser model. Runs smoothly on most laptops, MacBooks, and high-end phones.',
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 1.7B Instruct (Compact & Sharp)',
    size: '~1.1 GB',
    vramReq: '2.0 GB VRAM / RAM',
    recommended: false,
    description: 'Excellent reasoning and conversation quality in a compact footprint.',
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B Instruct (High IQ)',
    size: '~1.9 GB',
    vramReq: '3.0 GB VRAM / RAM',
    recommended: false,
    description: 'Powerful multi-turn reasoning and coding capabilities for modern laptops.',
  },
  {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 Coder 1.5B (Code & Logic)',
    size: '~1.2 GB',
    vramReq: '2.0 GB VRAM / RAM',
    recommended: false,
    description: 'Optimized for programming, script generation, and structured problem solving.',
  },
];

let globalEngine: MLCEngine | null = null;
let currentLoadedModelId: string | null = null;
let isInitializing = false;

/**
 * Check if the user's browser and hardware support WebGPU
 */
export async function checkWebGpuSupport(): Promise<WebGpuDeviceInfo> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: false, error: 'Not in browser environment' };
  }

  if (!(navigator as any).gpu) {
    return {
      supported: false,
      error: 'WebGPU is not enabled in this browser. Please use Chrome, Brave, Edge (v113+) or enable chrome://flags/#enable-unsafe-webgpu.',
    };
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        error: 'No compatible WebGPU hardware adapter found. Ensure GPU drivers and hardware acceleration are enabled.',
      };
    }

    const info = (await adapter.requestAdapterInfo?.()) || {};
    return {
      supported: true,
      adapterName: info.description || info.device || 'Standard WebGPU Adapter',
      vendor: info.vendor || 'Unknown Vendor',
      architecture: info.architecture || 'Universal WebGPU Compute',
    };
  } catch (err: any) {
    return {
      supported: false,
      error: err?.message || 'Failed to initialize WebGPU adapter',
    };
  }
}

/**
 * Get currently loaded model ID or null
 */
export function getActiveWebLlmModelId(): string | null {
  return currentLoadedModelId;
}

/**
 * Check if engine is ready
 */
export function isWebLlmReady(): boolean {
  return !!globalEngine && !!currentLoadedModelId;
}

/**
 * Initialize or switch WebLLM model
 */
export async function initWebLlmEngine(
  modelId: string = 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngine> {
  if (globalEngine && currentLoadedModelId === modelId) {
    return globalEngine;
  }

  if (isInitializing) {
    throw new Error('WebLLM is currently initializing another model. Please wait.');
  }

  isInitializing = true;

  try {
    const gpuCheck = await checkWebGpuSupport();
    if (!gpuCheck.supported) {
      throw new Error(gpuCheck.error || 'WebGPU not supported on this device');
    }

    const engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        if (onProgress) {
          onProgress(report);
        }
      },
    });

    globalEngine = engine;
    currentLoadedModelId = modelId;
    return engine;
  } finally {
    isInitializing = false;
  }
}

/**
 * Unload model from memory to free VRAM
 */
export async function unloadWebLlmEngine(): Promise<void> {
  if (globalEngine) {
    try {
      await globalEngine.unload();
    } catch {
      // ignore
    }
    globalEngine = null;
    currentLoadedModelId = null;
  }
}

/**
 * Run chat inference with in-browser WebLLM
 */
export async function generateWebLlmChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  modelId: string = 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  onTokenChunk?: (chunk: string) => void,
  onProgress?: (report: InitProgressReport) => void
): Promise<{ text: string; timeTakenSec: number }> {
  const startTime = Date.now();

  let engine = globalEngine;
  if (!engine || currentLoadedModelId !== modelId) {
    engine = await initWebLlmEngine(modelId, onProgress);
  }

  let fullResponse = '';

  if (onTokenChunk) {
    const chunks = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1536,
    });

    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        onTokenChunk(delta);
      }
    }
  } else {
    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1536,
    });
    fullResponse = reply.choices[0]?.message?.content || '';
  }

  const timeTakenSec = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
  return {
    text: fullResponse,
    timeTakenSec,
  };
}
