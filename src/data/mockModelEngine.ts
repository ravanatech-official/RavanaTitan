import { GeneratedToken, GenerationConfig } from '../types/model';
import { EXPERT_REGISTRY } from './modelSpecs';

// SentencePiece simulated tokenizer
export function tokenizeText(text: string): { tokens: string[]; tokenIds: number[] } {
  if (!text) return { tokens: [], tokenIds: [] };

  const regex = /([a-zA-Z]+|[0-9]+|[^\s\w]|\s+)/g;
  const matches = text.match(regex) || [text];
  
  const tokens: string[] = [];
  const tokenIds: number[] = [];

  let isFirst = true;
  for (const m of matches) {
    if (m === ' ') {
      continue;
    } else if (m.startsWith(' ')) {
      const cleaned = ' ' + m.trim();
      tokens.push(cleaned);
      tokenIds.push(hashStringToTokenId(cleaned));
    } else {
      const piece = (isFirst ? '' : ' ') + m;
      tokens.push(piece);
      tokenIds.push(hashStringToTokenId(piece));
      isFirst = false;
    }
  }

  return { tokens, tokenIds };
}

export function hashStringToTokenId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  // Grok vocabulary size is 131,072 (128 * 1024)
  return Math.abs(hash % 131070) + 2;
}

export interface EngineResult {
  thinking: string;
  thoughtDuration: number;
  response: string;
}

export function generateGrokResponse(prompt: string, config?: GenerationConfig): EngineResult {
  const p = prompt.trim().toLowerCase();

  if (p.includes("answer to life") || p.includes("universe") || p.includes("42")) {
    return {
      thoughtDuration: 1.8,
      thinking: `1. Deconstruct query: Famous Douglas Adams reference from 'Hitchhiker's Guide to the Galaxy'.
2. Router activation: Expert 3 (Universal Knowledge) + Expert 4 (Creative & Linguistic Synthesis).
3. Compute semantic nuance: The answer itself (42) vs. the unknown Ultimate Question.
4. Synthesize witty, razor-sharp response with computational context.`,
      response: `The answer to life, the universe, and everything is, of course, **42**.

According to Douglas Adams' supercomputer *Deep Thought*, it took **7.5 million years** of calculation across millions of gigawatts of processing power to arrive at this integer.

However, as Deep Thought notoriously pointed out:
> *"The problem, to be quite honest with you, is that you've never actually known what the question is."*

To calculate the Ultimate Question itself required a computer so vast and organic that it was designated Earth, which—unluckily for us—was demolished 5 minutes before completion to make way for a hyperspace bypass. 

Until that calculation resumes, 42 remains our universe's favorite cosmological constant.`
    };
  }

  if (p.includes("raptor") || p.includes("spacex") || p.includes("web solution") || p.includes("ravana tech")) {
    return {
      thoughtDuration: 2.3,
      thinking: `1. Query context: Analyzing SpaceX Raptor 3 engineering principles applied to modern Web Solutions & Ravana Tech architecture.
2. Router activation: Expert 1 (Systems & Algorithmic Code) + Expert 2 (Deep Deductive Reasoning).
3. Core thesis: Raptor 3 achieved perfection by eliminating all external plumbing—integrating flow channels directly into 3D-printed regeneratively cooled manifolds.
4. Map to software engineering: Zero bloated frameworks, edge-native microservices, sub-20ms TTFB, bulletproof database contracts.`,
      response: `### The "Raptor 3" Web Architecture Philosophy

Elon Musk's **SpaceX Raptor 3** rocket engine is a masterclass in extreme engineering:
- **Raptor 1 & 2:** Crowded with hundreds of external pipes, sensors, braided hoses, and wiring harnesses. Vulnerable to vibration failure.
- **Raptor 3:** Stripped of all external clutter. Flange-less, 3D-printed internal regenerative cooling channels, minimal heat shielding required, producing **350 bar chamber pressure** and **280 tons of thrust** at higher reliability and half the mass.

\`\`\`
[Traditional Web Agency]        [Ravana Tech "Raptor 3" Standard]
├── 50+ NPM bloated packages     ├── Zero-slop minimal edge runtime
├── Heavy client hydration lags   ├── Sub-20ms Instant SSR / Edge cache
├── Fragile REST spaghetti       ├── Type-safe contracts & gRPC / WebSockets
└── $5,000/mo sluggish servers   └── Cloud SQL + Vector scale-to-zero
\`\`\`

#### How Ravana Tech Engineers Solutions:
1. **Frontend:** Zero-pill, distraction-free obsidian UI with instant 60 FPS client rendering.
2. **Backend Engine:** High-concurrency Node.js / Go microservices running on distributed compute meshes.
3. **Database Layer:** Cloud SQL PostgreSQL with connection pooling & sub-millisecond in-memory cache.
4. **AI Core:** RavanaTitan 314B sparse MoE engine driving autonomous workflows.

When clients hire Ravana Tech, they don't get a standard template. They get an aerospace-grade software rocket.`
    };
  }

  if (p.includes("moe") || p.includes("expert") || p.includes("router") || p.includes("314b")) {
    return {
      thoughtDuration: 2.1,
      thinking: `1. Query analysis: Mixture-of-Experts (MoE) 8-expert top-2 routing topology in Grok-1 / RavanaTitan.
2. Router activation: Expert 0 (Formal Logic) + Expert 1 (Systems & Code).
3. Mathematical formulation: G(x) = Top2(Softmax(x * W_gate)).
4. Compute active vs total: 314B total parameters, 86B active per token across 64 layers.`,
      response: `### RavanaTitan / Grok-1 314B MoE Architecture

In a standard dense transformer, all 314 billion parameters would compute every single token, requiring an impossible compute cluster for real-time latency.

RavanaTitan employs a **Sparse Mixture-of-Experts (MoE)** design:
- **Total Weights:** 314 Billion parameters across 64 transformer blocks.
- **Active Weights:** Only **86 Billion** parameters (~27%) active per forward pass.
- **Routing Gate:** Every token embedding x (dimension 6,144) is projected into the router:
  - logits = x * W_gate (where W_gate has shape [6144, 8])
  - routing_weights = Softmax(Top2(logits))

\`\`\`python
# JAX Haiku Top-2 Router Execution
top_logits, top_indices = jax.lax.top_k(logits, k=2)
routing_weights = jax.nn.softmax(top_logits, axis=-1)

# Dispatch to 2 selected Feed-Forward Networks (49,152 intermediate dim)
expert_output = (
    routing_weights[0] * expert_ffn[top_indices[0]](x) +
    routing_weights[1] * expert_ffn[top_indices[1]](x)
)
\`\`\`

This yields the reasoning depth of a 300B+ model with the operational throughput and latency of an 80B model.`
    };
  }

  if (p.includes("rope") || p.includes("rotary") || p.includes("math") || p.includes("proof")) {
    return {
      thoughtDuration: 1.9,
      thinking: `1. Query: Mathematical proof of Rotary Position Embeddings (RoPE).
2. Router activation: Expert 0 (Formal Logic & Math) + Expert 6 (Factuality Gate).
3. Core theorem: Relative positional invariance via orthogonal rotation matrices in 2D sub-planes.
4. Format theorem steps clearly.`,
      response: `### Mathematical Proof of Rotary Position Embeddings (RoPE)

In transformer self-attention, we seek an inner product <f_q(x_m, m), f_k(x_n, n)> that depends solely on the tokens x_m, x_n and their **relative distance** (m - n), rather than absolute indices m or n.

#### 1. 2D Coordinate Rotation
RoPE pairs coordinate dimensions (q_2i, q_2i+1) and rotates them by angle m * theta_i:
- R_m = [[cos(m*theta), -sin(m*theta)], [sin(m*theta), cos(m*theta)]]

#### 2. The Orthogonal Invariance Property
Because 2D rotation matrices form the group SO(2), rotation operations commute:
- R_m^T * R_n = R_{-m} * R_n = R_{n - m}

#### 3. Inner Product Evaluation
- <R_m * q, R_n * k> = (R_m * q)^T * (R_n * k) = q^T * (R_m^T * R_n) * k = q^T * R_{n - m} * k

**Conclusion:** The attention query-key score is strictly a function of the relative displacement (n - m). Absolute positional drift is mathematically eliminated, enabling seamless length generalization up to **8,192 tokens** in RavanaTitan.`
    };
  }

  // Default dynamic intelligent answer
  return {
    thoughtDuration: 1.4,
    thinking: `1. Ingest input: "${prompt.slice(0, 50)}..."
2. Router activation: Dynamic gating across 8 experts. Primary: Expert 3, Secondary: Expert 5.
3. Formulate concise, witty, high-signal response aligned with Grok-1 intelligence standards.`,
    response: `RavanaTitan (314B Sparse MoE) analyzed your inquiry:

> **"${prompt.trim()}"**

Across 64 transformer layers and 8 specialized sub-networks, the model routes token representations using active Top-2 gating (86B parameters active per forward pass).

Whether engineering high-concurrency cloud systems, optimizing distributed JAX/XLA kernels, or solving deep logical puzzles, RavanaTitan delivers maximum signal with zero fluff.`
  };
}

export function simulateTokenMetadata(tokenText: string, index: number, totalTokens: number): GeneratedToken {
  const lower = tokenText.toLowerCase();
  
  let primaryExpert = 3;
  let secondaryExpert = 4;

  if (/[0-9]|\+|\-|\*|\=|\/|sum|matrix|math|calculus/i.test(lower)) {
    primaryExpert = 0;
    secondaryExpert = 1;
  } else if (/jax|code|import|def|class|python|gpu|h100|nvlink|kernel|sharding|engine|docker/i.test(lower)) {
    primaryExpert = 1;
    secondaryExpert = 0;
  } else if (/because|therefore|hence|proves|reason|logic|argument|axiom|proof/i.test(lower)) {
    primaryExpert = 2;
    secondaryExpert = 6;
  } else if (/consciousness|emergence|meaning|mind|intelligence|universe|raptor/i.test(lower)) {
    primaryExpert = 2;
    secondaryExpert = 4;
  } else if (index > 40) {
    primaryExpert = (index % 8);
    secondaryExpert = ((index + 3) % 8);
  }

  const primaryWeight = 0.55 + (Math.sin(index * 1.7) * 0.25);
  const secondaryWeight = 1.0 - primaryWeight;

  const selectedExperts = [
    { expertId: primaryExpert, weight: parseFloat(primaryWeight.toFixed(3)) },
    { expertId: secondaryExpert, weight: parseFloat(secondaryWeight.toFixed(3)) },
  ];

  const layerGateActivations = Array.from({ length: 8 }, (_, lIdx) => {
    return Math.floor(Math.sin(index * 0.4 + lIdx) * 3 + 4) % 8;
  });

  return {
    text: tokenText,
    id: hashStringToTokenId(tokenText),
    logprob: parseFloat((-0.15 - Math.random() * 0.85).toFixed(3)),
    selectedExperts,
    layerGateActivations,
  };
}

export function getSimulatedResponseTokens(prompt: string): string[] {
  const result = generateGrokResponse(prompt);
  return result.response.split(/(\s+|[.,!?;:()[\]{}"])/).filter(Boolean);
}

