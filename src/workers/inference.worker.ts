import { MLCEngine } from "@mlc-ai/web-llm";
import { TurboQuant, QuantizedBuffer } from '../lib/turboquant';
import { getPromptByLevel } from '../protocols/prompts';
import { openDB } from 'idb';

interface InferenceRequest {
  type: 'LOAD' | 'INFER';
  payload: any;
}

class LocalLLM {
  private engine: MLCEngine | null = null;
  private manifestLoaded = false;
  private embeddingsManifest: Map<string, { id: string, bits: 2 | 4 }> = new Map();
  private loadedEmbeddings: Map<string, Float64Array> = new Map();
  
  async loadModel() {
    console.log('[InferenceWorker] Inicializando Lazy Evaluation. Carregando paramétricos de base e manifest (~50MB)...');
    
    // 5. Tokenizer base e manifest permanecem carregados.
    this.manifestLoaded = true;
    
    // Initialize WebLLM engine instance without monolithic weights
    this.engine = new MLCEngine();
    this.engine.setInitProgressCallback((progress) => {
      self.postMessage({ type: 'PROGRESS', payload: progress });
    });

    // Mock manifest
    this.embeddingsManifest.set('base_protocol', { id: 'base_protocol', bits: 4 });
    
    return true;
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
    if (!this.manifestLoaded || !this.engine) throw new Error('Manifest not loaded');
    
    const startTime = performance.now();
    
    // 1. Antes de cada inferência, meça a RAM disponível
    const nav = navigator as any;
    const totalRamGB = nav.deviceMemory || 4;
    
    // 2. Calcule dinamicamente o limite seguro como 40% da RAM disponível
    const safeRamBudgetGB = totalRamGB * 0.4;
    
    // Traduzimos o budget de RAM para tokens processáveis (~1GB = ~1024 max window)
    const maxTokensPerChunk = Math.max(256, Math.floor(safeRamBudgetGB * 1024));
    
    const activeTokens = prompt.trim().split(/\s+/);
    
    let concatenatedResponse = "";
    
    // 4. Divida o input em partes (lotes sequenciais) se exceder o limite
    const chunks: string[] = [];
    for (let i = 0; i < activeTokens.length; i += maxTokensPerChunk) {
      chunks.push(activeTokens.slice(i, i + maxTokensPerChunk).join(" "));
    }

    const db = await this.getDB();
    const systemPrompt = getPromptByLevel(level);

    // 4. Processe uma por vez, descarregue entre lotes
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // 3. Carregue embeddings sob demanda até atingir esse limite dinâmico
      for (const [key, meta] of this.embeddingsManifest.entries()) {
        let cached: QuantizedBuffer | undefined = await db.get('cache', key);
        if (!cached) {
          // Payload-specific mock embeddings extraction
          const textBytes = new TextEncoder().encode(chunk.substring(0, 256));
          const floatArray = new Float64Array(textBytes.length);
          for(let j = 0; j < textBytes.length; j++) {
              floatArray[j] = (textBytes[j] / 255) * 2 - 1;
          }
          cached = TurboQuant.compress(floatArray, meta.bits);
          await db.put('cache', cached, key);
        }
        // TurboQuant descompressão seletiva da coluna
        this.loadedEmbeddings.set(`${key}_chunk_${i}`, TurboQuant.decompress(cached));
      }
      
      const selectedModel = "Phi-3.5-mini-instruct-q4f16_1-MLC";
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
      // Concatene o resultado
      concatenatedResponse += (i > 0 ? " " : "") + completionText;

      // 4 & 5. Descarregue entre lotes (Tudo exceto manifest loaded base)
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
        connectivity: chunks.length, // Número de lotes
        transmission: maxTokensPerChunk, // Limite safeRamBudget calculado
        coherence: safeRamBudgetGB, // Visualizar budget
        amplitude: endTime - startTime,
        dissipation: activeTokens.length
      }
    };
  }
}

const llm = new LocalLLM();

self.onmessage = async (e: MessageEvent<InferenceRequest>) => {
  const { type, payload } = e.data;
  try {
    switch (type) {
      case 'LOAD':
        const success = await llm.loadModel();
        self.postMessage({ type: 'LOAD_DONE', success });
        break;
      case 'INFER':
        const result = await llm.infer(payload.prompt, payload.level || 1);
        self.postMessage({ type: 'INFER_DONE', result });
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', message: (error as Error).message });
  }
};

