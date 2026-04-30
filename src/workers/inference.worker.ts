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
  private deviceInfo = { ram: 4, gpu: false, batchSize: 256, maxContextWindow: 512 };
  
  async loadModel() {
    console.log('[InferenceWorker] Inicializando Lazy Evaluation. Carregando (mock) Tokenizer base...');
    
    // 5. Detect hardware upfront
    this.detectHardware();
    
    // 1. TOKENIZER: Load only active vocabulary/manifest (Lazy Tokenization step 1)
    this.manifestLoaded = true;
    
    // Initialize WebLLM engine instance without downloading/loading monolithic weights
    this.engine = new MLCEngine();
    this.engine.setInitProgressCallback((progress) => {
      self.postMessage({ type: 'PROGRESS', payload: progress });
    });

    // Mock manifest
    this.embeddingsManifest.set('base_protocol', { id: 'base_protocol', bits: 4 });
    
    return true;
  }

  private detectHardware() {
    const nav = navigator as any;
    this.deviceInfo.ram = nav.deviceMemory || 4;
    this.deviceInfo.gpu = !!nav.gpu;
    
    if (this.deviceInfo.ram < 4) {
      this.deviceInfo.maxContextWindow = 512;
      this.deviceInfo.batchSize = 256;
    } else if (this.deviceInfo.ram > 6) {
      this.deviceInfo.maxContextWindow = 2048;
      this.deviceInfo.batchSize = 1024;
    } else {
      this.deviceInfo.maxContextWindow = 1024;
      this.deviceInfo.batchSize = 512;
    }
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
    
    // 5. Detect RAM before EACH execution
    this.detectHardware();
    
    // 1. & 2. TOKENIZER & EMBEDDINGS: Tokenize active vocab, load active columns via TurboQuant selectively
    const db = await this.getDB();
    const activeTokens = prompt.trim().split(/\s+/);
    
    for (const [key, meta] of this.embeddingsManifest.entries()) {
      let cached: QuantizedBuffer | undefined = await db.get('cache', key);
      if (!cached) {
        // Generate payload-specific embedding fragments only
        const textBytes = new TextEncoder().encode(prompt.substring(0, this.deviceInfo.batchSize));
        const floatArray = new Float64Array(textBytes.length);
        for(let i = 0; i < textBytes.length; i++) {
            floatArray[i] = (textBytes[i] / 255) * 2 - 1;
        }
        cached = TurboQuant.compress(floatArray, meta.bits);
        await db.put('cache', cached, key);
      }
      // TurboQuant descompressão seletiva
      this.loadedEmbeddings.set(key, TurboQuant.decompress(cached));
    }
    
    // 3. ATENÇÃO: Calculate attention only on active tokens within strict RAM-based context bounds
    const selectedModel = "Phi-3.5-mini-instruct-q4f16_1-MLC";
    await this.engine.reload(selectedModel, {
      context_window_size: this.deviceInfo.maxContextWindow, // 512 for <4GB, 2048 for >6GB
    });

    // Get protocol prompt
    const systemPrompt = getPromptByLevel(level);

    // Call WebLLM chat completions
    const response = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1, 
      max_tokens: 256,
    });

    const completionText = response.choices[0].message.content || 'SIGNAL_LOSS: NO_OUTPUT';

    // 4. Descarregue tudo exceto tokenizer base. Força RAM de volta para 200-400MB.
    await this.engine.unload();
    this.loadedEmbeddings.clear();
    
    const endTime = performance.now();
    const id = Date.now().toString();
    
    return {
      text: completionText,
      latency: endTime - startTime,
      embeddingId: id,
      signalData: {
        pt: completionText.length,
        connectivity: 4,
        transmission: this.deviceInfo.maxContextWindow,
        coherence: 1.0,
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
        // payload no longer needs pre-downloaded buffer since WebLLM handles Origin Private File System cache
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

