import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DepthLevel, ProcessState, ModelStatus, HistoryItem, ProcessResponse } from '../types';

interface AppState {
  input: string;
  depth: DepthLevel;
  state: ProcessState;
  modelStatus: ModelStatus;
  modelProgress: string;
  result: ProcessResponse | null;
  history: HistoryItem[];
  error: string | null;
  
  setInput: (input: string) => void;
  setDepth: (depth: DepthLevel) => void;
  setState: (state: ProcessState) => void;
  setModelStatus: (status: ModelStatus) => void;
  setModelProgress: (progress: string) => void;
  setResult: (result: ProcessResponse | null) => void;
  setError: (error: string | null) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      input: '',
      depth: 1,
      state: 'idle',
      modelStatus: 'none',
      modelProgress: '',
      result: null,
      history: [],
      error: null,

      setInput: (input) => set({ input }),
      setDepth: (depth) => set({ depth }),
      setState: (state) => set({ state }),
      setModelStatus: (modelStatus) => set({ modelStatus }),
      setModelProgress: (modelProgress) => set({ modelProgress }),
      setResult: (result) => set({ result }),
      setError: (error) => set({ error }),
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) 
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'giluy-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);

