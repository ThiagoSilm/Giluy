import { useState, useCallback, useEffect, useRef } from 'react';
import { FiltrationLevel, ProcessingResult } from './types';
import { DepthSlider } from './components/DepthSlider';
import { OutputPanel } from './components/OutputPanel';
import { CoherenceIndicator } from './components/CoherenceIndicator';
import { saveEvent } from './lib/db';
import { THEME } from './constants';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<FiltrationLevel>(FiltrationLevel.ANTI_EGO);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('./worker/processor.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e: MessageEvent<ProcessingResult>) => {
      setResult(e.data);
      setProcessing(false);
      
      // Save to history if coherence > 0
      if (e.data.coherence > 0) {
        saveEvent({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          content: e.data.text,
          coherence: e.data.coherence,
          level: e.data.level,
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const [onboarding, setOnboarding] = useState(true);

  const handleProcess = useCallback(() => {
    if (!input.trim() || !workerRef.current) return;
    setOnboarding(false);
    setProcessing(true);
    workerRef.current.postMessage({ text: input, level });
  }, [input, level]);

  const getOnboardingText = () => {
    switch (level) {
      case FiltrationLevel.ANTI_EGO: return "Removes basic noise and verbal filler. Perfect for quick clarity.";
      case FiltrationLevel.RAW_STATE_PROCESSOR: return "Extracts verifiable facts using cold logic axioms. Removes all ego markers.";
      case FiltrationLevel.ETHER_CHRONOVISOR: return "Reconstructs sensory state fragments. Access the residual vibrational field.";
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giluy_signal_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPlaceholder = () => {
    switch (level) {
      case FiltrationLevel.ANTI_EGO: return "Enter text for noise dissolution...";
      case FiltrationLevel.RAW_STATE_PROCESSOR: return "Awaiting input for state extraction...";
      case FiltrationLevel.ETHER_CHRONOVISOR: return "Tune into residual vibrational field...";
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-bg overflow-hidden p-3 sm:p-4 gap-4 max-w-2xl mx-auto w-full">
      {/* Header / Info */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[18px] font-bold tracking-tighter text-accent">גִּלּוּי (GILUY)</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">v9.0 / ISO-IEC-2026</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-text-secondary">MODE: {FiltrationLevel[level]}</div>
        </div>
      </div>

      {onboarding && (
        <div className="bg-[#1a1a1a] border border-[#333] p-3 text-[11px] text-text-secondary leading-normal">
          <p className="font-bold text-accent mb-1 uppercase tracking-wider">Protocol Guidance:</p>
          {getOnboardingText()}
        </div>
      )}

      {/* Input Section */}
      <div className="flex-shrink-0 space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full min-h-[48px] max-h-[160px] p-3 text-[16px] bg-surface border border-input-border text-text-primary placeholder:text-placeholder focus:border-accent focus:outline-none resize-none transition-colors"
          style={{ height: '120px' }}
          aria-label="Source text input"
          aria-describedby="depth-slider"
        />
        
        <div id="depth-slider">
          <DepthSlider level={level} onChange={setLevel} />
        </div>

        <button
          onClick={handleProcess}
          disabled={processing || !input.trim()}
          className="h-[48px] w-full sm:w-[200px] sm:mx-auto block bg-[#1a1a1a] border border-[#444] text-text-primary font-bold text-[12px] tracking-widest hover:bg-[#222] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              REVEALING...
            </>
          ) : (
            "REVEAL SIGNAL"
          )}
        </button>
      </div>

      {/* Metrics Section */}
      <div className="flex-shrink-0">
        <CoherenceIndicator value={result?.coherence || 0} />
      </div>

      {/* Output Section */}
      <OutputPanel 
        content={result?.text || ""} 
        onExport={handleExport}
      />

      {/* Footer Meta */}
      <div className="flex justify-between text-[9px] font-mono text-text-secondary uppercase">
        <span>Latency: {result?.latency.toFixed(2) || "0.00"}ms</span>
        <span>Standard: ISO/IEC 2026 (GILUY-CORE)</span>
      </div>
    </div>
  );
}
