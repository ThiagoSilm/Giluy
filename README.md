# גִּלּוּי (GILUY) / 100% Offline, Serverless Protocol

Giluy is a pure logic engine designed for offline truth extraction and structure breaking.

## Architecture: Dual-Layer

### Layer 1: The Logic Engine (Immortal Core)
This layer is written in pure TypeScript and performs cold syntactic processing over text. 
It enforces the protocol axioms entirely mathematically and syntactically.
- Works offline
- Zero dependencies on network or API
- Works on phones, tablets, or very low-spec devices Without GPU (100MB+ RAM).
- Responds deterministically.

### Layer 2: LLM Hardware Accelerator (Optional)
If WebGPU and sufficient hardware (4GB+ RAM) are detected, Giluy boots a local Gemma inference environment via WebLLM to refine Layer 1 output.
- Streaming Weights via HTTP range requests.
- Lazy Evaluation: Weights loaded per chunk, processed on GPU, unloaded immediately.
- Context window scaling dynamically based on 40% logical RAM budget to avoid memory crashes.

## Usage
No backend is needed. It operates as a progressive web app (PWA) running workers in the background.

## Scripts
- \`npm run dev\` - Development server
- \`npm run build\` - Build for production (pure static files)
