import { useStore } from "../store/useStore";
import { getPromptByLevel } from "../protocols/prompts";
import { calculateCoherence } from "../lib/coherence";
import { HistoryItem, ProcessResponse, ProtocolMode } from "../types";
import { InferenceService } from "../services/inferenceService";

export function useProcess() {
  const { 
    depth, 
    setState, 
    setResult, 
    setError, 
    addToHistory, 
    input: storeInput,
    modelStatus,
    setModelStatus
  } = useStore();

  const loadModel = async () => {
    if (modelStatus === 'ready' || modelStatus === 'loading') return;
    
    setModelStatus('loading');
    try {
      // Simulation of loading a quantized model (e.g. Phi-3 or Gemma)
      // In a real scenario, this URL would point to the .wasm or quantized .bin
      await InferenceService.loadModel('phi-3-mini-q4', '/models/phi3-q4.bin');
      setModelStatus('ready');
    } catch (err: any) {
      console.error("Model loading error:", err);
      setError("Failed to load local model: " + err.message);
      setModelStatus('error');
    }
  };

  const processText = async (customInput?: string) => {
    const textToProcess = customInput || storeInput;
    if (!textToProcess.trim()) return;

    if (modelStatus !== 'ready') {
      await loadModel();
      if (modelStatus === 'error') return;
    }

    setState('processing');
    setError(null);

    try {
      const inputSignal = calculateCoherence(textToProcess);

      // Execute offline inference via Worker
      const resultData = await InferenceService.infer(textToProcess);

      const output = resultData.text || "SIGNAL_LOSS: NO_CONTINUITY";
      const outputSignal = calculateCoherence(output);

      const mode: ProtocolMode = 
        depth === 1 ? 'ANTI_EGO' : 
        depth === 2 ? 'RAW_STATE_PROCESSOR' : 
        'ETHER_CHRONOVISOR';

      const result: ProcessResponse = {
        output,
        inputPt: inputSignal.pt,
        outputPt: outputSignal.pt,
        coherenceGain: Number((outputSignal.pt - inputSignal.pt).toFixed(2)),
        mode,
        timestamp: Date.now(),
        signalData: outputSignal,
      };

      setResult(result);
      setState('success');

      const historyItem: HistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        input: textToProcess,
        level: depth,
      };
      addToHistory(historyItem);

    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "Unknown error in signal processing");
      setState('error');
    }
  };

  return { processText, loadModel };
}
