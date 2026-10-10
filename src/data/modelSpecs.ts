import { ModelSpec, ExpertDefinition } from '../types/model';

export const RAVANA_TITAN_SPEC: ModelSpec = {
  name: "RavanaTitan (Grok-1 Architecture)",
  codename: "Titan-314B-MoE",
  totalParams: "314 Billion",
  activeParams: "86 Billion (2/8 Experts Active)",
  layers: 64,
  qHeads: 48,
  kvHeads: 8,
  embSize: 6144, // 48 * 128
  keySize: 128,
  wideningFactor: 8, // FFN intermediate size = 49,152
  contextLength: 8192,
  vocabSize: 131072, // 128 * 1024
  numExperts: 8,
  numSelectedExperts: 2,
  outputMultiplierScale: 0.5773502691896257,
  embeddingMultiplierScale: 78.38367176906169,
  attnOutputMultiplier: 0.08838834764831845,
};

export const EXPERT_REGISTRY: ExpertDefinition[] = [
  {
    id: 0,
    name: "Expert 0: Formal Logic & Math",
    domain: "Mathematics & Symbolic Proofs",
    description: "Calculus, linear algebra, theorem derivation, and formal axiomatic reasoning.",
    color: "#6366f1",
    accentBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  {
    id: 1,
    name: "Expert 1: Systems & Algorithmic Code",
    domain: "Software Engineering & Low-Level Kernels",
    description: "JAX, CUDA, distributed systems, compiler transforms, and data structures.",
    color: "#06b6d4",
    accentBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    id: 2,
    name: "Expert 2: Deep Deductive Reasoning",
    domain: "Multi-Step Chain of Thought",
    description: "Long-horizon planning, puzzle decomposition, and counterfactual analysis.",
    color: "#8b5cf6",
    accentBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: 3,
    name: "Expert 3: Universal Knowledge",
    domain: "World Facts, Entities & Science",
    description: "Encyclopedic world history, physics, cosmology, biology, and real-world ontology.",
    color: "#ec4899",
    accentBg: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
  {
    id: 4,
    name: "Expert 4: Creative & Linguistic Synthesis",
    domain: "Creative Writing & Rhetoric",
    description: "Stylistic nuances, metaphors, witty humor, and expressive prose generation.",
    color: "#f59e0b",
    accentBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    id: 5,
    name: "Expert 5: Multi-Turn Alignment & Policy",
    domain: "Instruction Following & Safety",
    description: "Conversation state preservation, nuance adherence, and goal persistence.",
    color: "#10b981",
    accentBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    id: 6,
    name: "Expert 6: Factuality & Precision Gate",
    domain: "Verification & Error Detection",
    description: "Source corroboration, hallucination mitigation, and consistency gating.",
    color: "#3b82f6",
    accentBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    id: 7,
    name: "Expert 7: Long-Range Cross-Attention",
    domain: "Large Context Window Retrieval",
    description: "8,192 sequence position mapping, document synthesis, and associative memory.",
    color: "#14b8a6",
    accentBg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  },
];

export const PRESET_PROMPTS = [
  {
    title: "Classic Hitchhiker Prompt (from run.py)",
    prompt: "The answer to life the universe and everything is of course",
    category: "Classic Benchmark",
    tag: "Core Test",
  },
  {
    title: "MoE Sharded Mesh Distribution",
    prompt: "Explain how RavanaTitan shards 314B weights across 8x H100 GPUs using JAX local_mesh_config=(1, 8) and 8-bit quantized weights.",
    category: "Architecture",
    tag: "Distributed JAX",
  },
  {
    title: "Mathematical Optimization Proof",
    prompt: "Prove why Rotary Position Embeddings (RoPE) preserve relative distances invariant to absolute token positions in multi-head attention.",
    category: "Mathematics",
    tag: "Attention & RoPE",
  },
  {
    title: "Top-2 Expert Router Logic",
    prompt: "Write a high-performance JAX Haiku module implementing the Top-2 gating mechanism over 8 experts with softmax routing.",
    category: "Code & Engineering",
    tag: "Kernel Design",
  },
  {
    title: "Philosophical Exploration",
    prompt: "If machine consciousness emerged from sparse mixture-of-experts routing, would understanding be localized in individual sub-networks?",
    category: "Reasoning",
    tag: "Philosophy",
  },
];
