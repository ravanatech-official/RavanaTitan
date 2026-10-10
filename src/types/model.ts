export interface ModelSpec {
  name: string;
  codename: string;
  totalParams: string;
  activeParams: string;
  layers: number;
  qHeads: number;
  kvHeads: number;
  embSize: number;
  keySize: number;
  wideningFactor: number;
  contextLength: number;
  vocabSize: number;
  numExperts: number;
  numSelectedExperts: number;
  outputMultiplierScale: number;
  embeddingMultiplierScale: number;
  attnOutputMultiplier: number;
}

export interface ExpertDefinition {
  id: number;
  name: string;
  domain: string;
  description: string;
  color: string;
  accentBg: string;
}

export interface GeneratedToken {
  text: string;
  id: number;
  logprob: number;
  selectedExperts: { expertId: number; weight: number }[];
  layerGateActivations?: number[];
}

export interface GenerationMetrics {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  elapsedMs: number;
  tokensPerSec: number;
  ttftMs: number;
  kvCacheMb: number;
  activeVramGb: number;
}

export interface GenerationConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  repetitionPenalty: number;
  seed: number;
  thinkMode?: boolean;
  deepSearch?: boolean;
  funMode?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingContent?: string;
  thoughtDurationSec?: number;
  tokens?: GeneratedToken[];
  metrics?: GenerationMetrics;
  timestamp: string;
  isStreaming?: boolean;
  model?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type GrokNavView = 
  | 'chat' 
  | 'imagine' 
  | 'library' 
  | 'automations' 
  | 'moe' 
  | 'architecture' 
  | 'hardware' 
  | 'tokenizer' 
  | 'code';
