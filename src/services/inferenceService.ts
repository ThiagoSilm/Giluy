import { useStore } from '../store/useStore';

export class InferenceService {
  private static worker: Worker | null = null;
  private static isInitialized = false;

  static async init() {
    if (this.isInitialized) return;

    // Initialize worker
    this.worker = new Worker(new URL('../workers/inference.worker.ts', import.meta.url), {
      type: 'module'
    });

    this.isInitialized = true;
    console.log('[InferenceService] Initialized');
  }

  static async loadModel(modelId: string, modelUrl: string): Promise<void> {
    await this.init();

    // The worker now dynamically loads the phi-3.5 model using WebLLM which caches 
    // it directly via Origin Private File System/IndexedDB, thus no manual mock is needed.

    return new Promise((resolve, reject) => {
      if (!this.worker) return reject('Worker not initialized');

      const handler = (e: MessageEvent) => {
        if (e.data.type === 'PROGRESS') {
           useStore.getState().setModelProgress(e.data.payload.text);
        } else if (e.data.type === 'LOAD_DONE') {
          this.worker?.removeEventListener('message', handler);
          resolve();
        } else if (e.data.type === 'ERROR') {
          this.worker?.removeEventListener('message', handler);
          reject(e.data.message);
        }
      };

      this.worker.addEventListener('message', handler);
      this.worker.postMessage({
        type: 'LOAD',
        payload: {}
      });
    });
  }

  static async infer(prompt: string, level: 1 | 2 | 3): Promise<any> {
    if (!this.worker) throw new Error('Inference worker not initialized');

    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'INFER_DONE') {
          this.worker?.removeEventListener('message', handler);
          resolve(e.data.result);
        } else if (e.data.type === 'ERROR') {
          this.worker?.removeEventListener('message', handler);
          reject(e.data.message);
        }
      };

      this.worker!.addEventListener('message', handler);
      this.worker!.postMessage({
        type: 'INFER',
        payload: { prompt, level }
      });
    });
  }
}


