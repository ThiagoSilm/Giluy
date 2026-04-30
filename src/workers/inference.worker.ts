import { MLCEngine } from "@mlc-ai/web-llm";
import { TurboQuant, QuantizedBuffer } from '../lib/turboquant';
import { getPromptByLevel } from '../protocols/prompts';
import { applyLogicLayer } from '../protocols/logicEngine';
import { openDB } from 'idb';

interface InferenceRequest {
  type: 'LOAD' | 'INFER';
  payload: any;
}

class InferenceEngine {
  private engine: MLCEngine | null = null;
  private embeddingsManifest: Map<string, { id: string, bits: 2 | 4 }> = new Map();
  private loadedEmbeddings: Map<string, Float64Array> = new Map();
  private canRunLLM = false;
  
  async loadModel() {
    console.log('[InferenceWorker] Inicializando a arquitetura Giluy...');
    // Layer 1 is pure TS, always ready.
    
    const nav = navigator as any;
    const totalRamGB = nav.deviceMemory || 4;
    const gpu = !!nav.gpu;
    
    // We only enable Layer 2 (LLM Accelerator) if GPU is available and RAM is decent
    this.canRunLLM = gpu && totalRamGB >= 4;
    
    if (this.canRunLLM) {
      console.log('[InferenceWorker] GPU e RAM detectados. Inicializando ACELERADOR LLM (Camada 2)...');
      this.engine = new MLCEngine();
      this.engine.setInitProgressCallback((progress) => {
        self.postMessage({ type: 'PROGRESS', payload: progress });
      });
      this.embeddingsManifest.set('base_protocol', { id: 'base_protocol', bits: 4 });
    } else {
      console.log('[InferenceWorker] Sistema operando na Camada 1 puramente (Motor Lógico Sem GPU).');
    }
    
    // Motor is always "ready" because Layer 1 is always available
    return { llmSupported: this.canRunLLM };
  }

  // indexedDB setup for embeddings caching
  private async getDB() {
    return openDB('giluy_embeddings', 1, {
      upgrade(db) {
        db.createObjectStore('cache');
      },
    });
  }

  async infer(prompt: string, level: 1 | 2 | 3) {
    const startTime = performance.now();
    
    // CAMADA 1: MOTOR LÓGICO (Always runs)
    const baseSignal = applyLogicLayer(prompt, level);
    
    // If we can't run LLM, or the base signal resulted in a fatal loss, return Layer 1 result immediately
    if (!this.canRunLLM || !this.engine || baseSignal.startsWith("SIGNAL_LOSS:") || baseSignal.startsWith("RESONANCE_LOSS:")) {
      const endTime = performance.now();
      return {
        text: baseSignal,
        latency: endTime - startTime,
        embeddingId: 'layer1_' + Date.now(),
        signalData: {
          pt: baseSignal.length,
          connectivity: 1,
          transmission: 1,
          coherence: 1.0,
          amplitude: endTime - startTime,
          dissipation: 0
        },
        layer: 1
      };
    }
    
    // CAMADA 2: ACELERADOR LLM
    try {
      const nav = navigator as any;
      const totalRamGB = nav.deviceMemory || 4;
      const safeRamBudgetGB = totalRamGB * 0.4;
      const maxTokensPerChunk = Math.max(256, Math.floor(safeRamBudgetGB * 1024));
      
      const activeTokens = prompt.trim().split(/\s+/);
      let concatenatedResponse = "";
      
      const chunks: string[] = [];
      for (let i = 0; i < activeTokens.length; i += maxTokensPerChunk) {
        chunks.push(activeTokens.slice(i, i + maxTokensPerChunk).join(" "));
      }

      const db = await this.getDB();
      const systemPrompt = getPromptByLevel(level) + `\n\nLAYER 1 KERNEL SIGNAL:\n${baseSignal}\n\nRefine this signal according to the absolute protocols, without breaking axioms. Output ONLY the refined payload. NO TRIVIA. NO CHAT. NO EXPLANATION.`;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        for (const [key, meta] of this.embeddingsManifest.entries()) {
          let cached: QuantizedBuffer | undefined = await db.get('cache', key);
          if (!cached) {
            const textBytes = new TextEncoder().encode(chunk.substring(0, 256));
            const floatArray = new Float64Array(textBytes.length);
            for(let j = 0; j < textBytes.length; j++) {
                floatArray[j] = (textBytes[j] / 255) * 2 - 1;
            }
            cached = TurboQuant.compress(floatArray, meta.bits);
            await db.put('cache', cached, key);
          }
          this.loadedEmbeddings.set(`${key}_chunk_${i}`, TurboQuant.decompress(cached));
        }
        
        const selectedModel = "gemma-2b-it-q4f16_1-MLC";
        await this.engine.reload(selectedModel, {
          context_window_size: maxTokensPerChunk,
        });

        const response = await this.engine.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: chunk }
          ],
          temperature: 0.1, 
          max_tokens: 256,
        });

        const completionText = response.choices[0].message.content || 'SIGNAL_LOSS: NO_OUTPUT';
        concatenatedResponse += (i > 0 ? " " : "") + completionText;

        await this.engine.unload();
        this.loadedEmbeddings.clear();
      }
      
      const endTime = performance.now();
      const id = Date.now().toString();
      
      return {
        text: concatenatedResponse,
        latency: endTime - startTime,
        embeddingId: id,
        signalData: {
          pt: concatenatedResponse.length,
          connectivity: chunks.length,
          transmission: maxTokensPerChunk,
          coherence: safeRamBudgetGB,
          amplitude: endTime - startTime,
          dissipation: activeTokens.length
        },
        layer: 2
      };

    } catch (error) {
      console.warn("LLM Accelerator falhou. Usando fallback da Camada 1.", error);
      const endTime = performance.now();
      return {
        text: baseSignal,
        latency: endTime - startTime,
        embeddingId: 'layer1_fallback_' + Date.now(),
        signalData: {
          pt: baseSignal.length,
          connectivity: 1,
          transmission: 1,
          coherence: 1.0,
          amplitude: endTime - startTime,
          dissipation: 0
        },
        layer: 1
      };
    }
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

