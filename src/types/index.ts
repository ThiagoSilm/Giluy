export type DepthLevel = 1 | 2 | 3;

export type ProtocolMode = 'ANTI_EGO' | 'RAW_STATE_PROCESSOR' | 'ETHER_CHRONOVISOR';

export interface CoherenceSignal {
  pt: number;
  connectivity: number;
  transmission: number;
  coherence: number;
  amplitude: number;
  dissipation: number;
}

export interface ProcessResponse {
  output: string;
  inputPt: number;
  outputPt: number;
  coherenceGain: number;
  mode: ProtocolMode;
  timestamp: number;
  signalData: CoherenceSignal;
}

export type ProcessState = 'idle' | 'processing' | 'success' | 'error';

export type ModelStatus = 'none' | 'loading' | 'ready' | 'error';

export interface HistoryItem extends ProcessResponse {
  id: string;
  input: string;
  level: DepthLevel;
}
