import { useStore } from "../store/useStore";
import { getPromptByLevel } from "../protocols/prompts";
import { calculateCoherence } from "../lib/coherence";
import { HistoryItem, ProcessResponse, ProtocolMode } from "../types";
import { callApi } from "../lib/api";

export function useProcess() {
  const { input, depth, setState, setResult, setError, addToHistory, input: storeInput } = useStore();

  const processText = async (customInput?: string) => {
    const textToProcess = customInput || storeInput;
    if (!textToProcess.trim()) return;

    setState('processing');
    setError(null);

    try {
      const systemInstruction = getPromptByLevel(depth);
      const inputSignal = calculateCoherence(textToProcess);

      const output = await callApi(systemInstruction, textToProcess);
      
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

  return { processText };
}
