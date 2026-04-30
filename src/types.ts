export enum FiltrationLevel {
  ANTI_EGO = 1,
  RAW_STATE_PROCESSOR = 2,
  ETHER_CHRONOVISOR = 3,
}

export interface ProcessingResult {
  text: string;
  coherence: number; // Pt: 0 to 1
  level: FiltrationLevel;
  error?: string;
  latency: number;
  source?: string;
}

export interface HistoricalEvent {
  id: string;
  timestamp: number;
  content: string;
  coherence: number;
  level: FiltrationLevel;
}
