/**
 * Free Hugging Face Serverless Inference Service
 * Connects to open Hugging Face serverless router / endpoints with 0 server costs.
 */

export interface HFModelInfo {
  id: string;
  name: string;
  description: string;
  context: string;
}

export const FREE_HF_MODELS: HFModelInfo[] = [
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen 2.5 72B Instruct (Flagship Reasoning)',
    description: 'Top open-weight LLM, exceptional in multilingual and coding tasks.',
    context: '32k context',
  },
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct',
    name: 'Llama 3.2 3B Instruct (Ultra Fast)',
    description: 'Meta\'s compact lightweight model for instantaneous conversational flow.',
    context: '8k context',
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B Instruct v0.3 (Uncensored / High Signal)',
    description: 'Crisp, unfiltered logic and instruction adherence.',
    context: '32k context',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-8B',
    name: 'DeepSeek R1 Distill Qwen 8B (Deep Thinking)',
    description: 'Deep chain-of-thought mathematical and reasoning engine.',
    context: '16k context',
  },
];

export async function queryHuggingFaceInference(
  prompt: string,
  modelId: string = 'Qwen/Qwen2.5-72B-Instruct',
  userHfToken?: string,
  systemPrompt?: string
): Promise<{ text: string; timeTakenSec: number }> {
  const startTime = Date.now();
  const token = userHfToken || (typeof window !== 'undefined' ? localStorage.getItem('HF_ACCESS_TOKEN') || '' : '');

  // HF Router Endpoint
  const url = `https://api-inference.huggingface.co/models/${modelId}`;

  const defaultSystem = systemPrompt || 'You are RavanaTitan, the foundation model by Ravana Tech. You are witty, sharp, unfiltered like Grok, and fluent in Sinhala and English.';

  const fullPrompt = `<|im_start|>system\n${defaultSystem}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Hugging Face inference error (Status ${response.status})`);
  }

  const result = await response.json();
  let generated = '';
  if (Array.isArray(result) && result[0]?.generated_text) {
    generated = result[0].generated_text;
  } else if (typeof result?.generated_text === 'string') {
    generated = result.generated_text;
  } else {
    generated = JSON.stringify(result);
  }

  // Clean trailing assistant tags if any
  generated = generated.replace(/<\|im_end\|>$/, '').trim();

  const timeTakenSec = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
  return {
    text: generated,
    timeTakenSec,
  };
}
