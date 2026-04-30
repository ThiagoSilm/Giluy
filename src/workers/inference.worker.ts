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
  private deviceInfo = { ram: 4, gpu: false, batchSize: 256 };
  
  async loadModel() {
    console.log('[InferenceWorker] Detector de hardware e lazy load manifest...');
    
    // 5. Detecte a capacidade do dispositivo
    const nav = navigator as any;
    this.deviceInfo.ram = nav.deviceMemory || 4;
    this.deviceInfo.gpu = !!nav.gpu;
    
    if (this.deviceInfo.gpu && this.deviceInfo.ram > 4) {
      this.deviceInfo.batchSize = 1024;
    } else if (this.deviceInfo.gpu) {
      this.deviceInfo.batchSize = 512;
    } else {
      this.deviceInfo.batchSize = 256;
    }
    
    // 2. Carregue apenas o tokenizer e o manifest dos embeddings
    this.manifestLoaded = true;
    
    // Initialize WebLLM engine instance without downloading/loading weights yet
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
    
    // 3. No evento 'INFER', carregue sob demanda apenas os embeddings necessários
    const db = await this.getDB();
    for (const [key, meta] of this.embeddingsManifest.entries()) {
      let cached: QuantizedBuffer | undefined = await db.get('cache', key);
      if (!cached) {
        // Mock generation of heavily quantized embedding for this block if not in IndexedDB
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
    
    // Load WebLLM weights ONLY for the inference
    const selectedModel = "Phi-3.5-mini-instruct-q4f16_1-MLC";
    await this.engine.reload(selectedModel);

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

    // 4. Após a inferência, descarregue da RAM os embeddings não mais necessários (Lazy Evaluation Unload)
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
        transmission: this.deviceInfo.batchSize,
        coherence: 1.0,
        amplitude: endTime - startTime,
        dissipation: this.embeddingsManifest.size
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

