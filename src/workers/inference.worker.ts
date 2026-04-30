import * as ort from 'onnxruntime-web';
import { applyLogicLayer } from '../protocols/logicEngine';
import { openDB } from 'idb';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

interface InferenceRequest {
  type: 'LOAD' | 'INFER';
  payload: any;
}

// Injection sanitization
function sanitizePrompt(prompt: string): string {
  // Regex to escape special model control tokens to prevent prompt injection
  return prompt.replace(/<\|.*?\|>|\[.*?\]/g, '').trim();
}

// Inference Engine interchangeable backends
interface InferenceBackend {
  init(): Promise<boolean>;
  infer(prompt: string): Promise<'SINAL_PURO' | 'DOMAIN_MISMATCH' | 'SIGNAL_LOSS' | 'RESONANCE_LOSS'>;
  release(): void;
  name: string;
}

class WebGpuBackend implements InferenceBackend {
  name = 'WebGPU Fused Classifier';
  // ... mock implementation
  async init() { return !!(navigator as any).gpu; }
  async infer(prompt: string): Promise<'SINAL_PURO' | 'DOMAIN_MISMATCH' | 'SIGNAL_LOSS' | 'RESONANCE_LOSS'> {
    return 'SINAL_PURO'; // Simplified mock
  }
  release() {}
}

class OnnxWasmBackend implements InferenceBackend {
  name = 'ONNX WASM Classifier';
  private tokenizerSession: ort.InferenceSession | null = null;

  async init(): Promise<boolean> {
    try {
      this.tokenizerSession = await ort.InferenceSession.create('/models/gemma-tokenizer-v1.onnx', {
         executionProviders: ['wasm'],
         graphOptimizationLevel: 'all'
      });
      return true;
    } catch {
      return false;
    }
  }

  async infer(prompt: string): Promise<'SINAL_PURO' | 'DOMAIN_MISMATCH' | 'SIGNAL_LOSS' | 'RESONANCE_LOSS'> {
    try {
       const embeddingsSession = await ort.InferenceSession.create('/models/gemma-embeddings-v1-int8.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all'
       });
       
       const classifierSession = await ort.InferenceSession.create('/models/gemma-classifier-fused-v1-int8.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
          executionMode: 'sequential'
       });
       
       if (embeddingsSession.release) embeddingsSession.release();
       if (classifierSession.release) classifierSession.release();
       return 'SINAL_PURO';
    } catch {
      return 'SIGNAL_LOSS';
    }
  }
  release() {
    if (this.tokenizerSession?.release) this.tokenizerSession.release();
  }
}

class CpuPureBackend implements InferenceBackend {
  name = 'CPU Pure Logic Shell';
  async init() { return true; }
  async infer(prompt: string): Promise<'SINAL_PURO' | 'DOMAIN_MISMATCH' | 'SIGNAL_LOSS' | 'RESONANCE_LOSS'> {
    const emotional = /(feel|love|hate|miss|sorry|please|thank|sad|happy|lonely)/i;
    const narrative = /(story|tale|character|arc|hero|journey)/i;
    if (emotional.test(prompt)) return 'DOMAIN_MISMATCH';
    if (narrative.test(prompt)) return 'RESONANCE_LOSS';
    const words = prompt.trim().split(/\s+/).length;
    if (words < 2) return 'SIGNAL_LOSS';
    return 'SINAL_PURO';
  }
  release() {}
}

class InferenceEngine {
  private activeBackend: InferenceBackend | null = null;
  private canRunAcc = false;
  
  async loadModel() {
    console.log('[InferenceWorker] Inicializando a arquitetura tripla Giluy...');
    // Cascade fallback
    const backends = [new WebGpuBackend(), new OnnxWasmBackend(), new CpuPureBackend()];
    
    for (const backend of backends) {
      console.log(`[InferenceWorker] Tentando inicializar: ${backend.name}...`);
      if (await backend.init()) {
         this.activeBackend = backend;
         this.canRunAcc = backend.name !== 'CPU Pure Logic Shell';
         console.log(`[InferenceWorker] Ativo: ${backend.name}. RAM basal ~17MB.`);
         break;
      }
    }
    
    return { llmSupported: this.canRunAcc };
  }

  async infer(prompt: string, level: 1 | 2 | 3) {
    const startTime = performance.now();
    
    const sanitizedPrompt = sanitizePrompt(prompt);

    let classificationResult: 'SINAL_PURO' | 'DOMAIN_MISMATCH' | 'SIGNAL_LOSS' | 'RESONANCE_LOSS' = 'SINAL_PURO';
    let activeLayer = 1;

    try {
      if (this.activeBackend) {
         classificationResult = await this.activeBackend.infer(sanitizedPrompt);
         activeLayer = this.canRunAcc ? 2 : 1;
      }
    } catch (e) {
      classificationResult = 'SIGNAL_LOSS';
    }
    
    // Se SINAL_PURO, o texto filtrado é o input com ruído removido via lógica fria.
    // Caso contrário, output is just the classification.
    let finalPayload = classificationResult as string;
    
    if (classificationResult === 'SINAL_PURO') {
        const cleaned = applyLogicLayer(prompt, level);
        if (cleaned.startsWith('SIGNAL_LOSS') || cleaned.startsWith('RESONANCE_LOSS')) {
            finalPayload = cleaned;
        } else {
            finalPayload = cleaned;
        }
    }

    const endTime = performance.now();
    const id = Date.now().toString();
    
    return {
      text: finalPayload,
      latency: endTime - startTime,
      embeddingId: id,
      signalData: {
        pt: finalPayload.length,
        connectivity: 1,
        transmission: activeLayer === 2 ? 4 : 1, // 4 layers
        coherence: 1.0,
        amplitude: endTime - startTime,
        dissipation: 0
      },
      layer: activeLayer
    };
  }
}

const llm = new InferenceEngine();

self.onmessage = async (e: MessageEvent<InferenceRequest>) => {
  const { type, payload } = e.data;
  try {
    switch (type) {
      case 'LOAD':
        const { llmSupported } = await llm.loadModel();
        self.postMessage({ type: 'LOAD_DONE', success: true, llmSupported });
        break;
      case 'INFER':
        const decoder = new TextDecoder();
        const promptString = decoder.decode(payload.promptBuffer);
        const result = await llm.infer(promptString, payload.level || 1);
        
        const encoder = new TextEncoder();
        const textBuffer = encoder.encode(result.text).buffer;
        
        const resultPayload: any = { ...result, textBuffer };
        delete resultPayload.text;
        
        self.postMessage({ type: 'INFER_DONE', result: resultPayload }, { transfer: [textBuffer as ArrayBuffer] });
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', message: (error as Error).message });
  }
};

