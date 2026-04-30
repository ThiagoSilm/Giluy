import React, { memo } from 'react';
import { useStore } from '../store/useStore';
import { DepthLevel } from '../types';
import { cn } from '../lib/utils';

export const DepthSlider: React.FC = memo(() => {
  const depth = useStore(s => s.depth);
  const setDepth = useStore(s => s.setDepth);

  const levels: { val: DepthLevel; label: string; desc: string }[] = [
    { val: 1, label: 'Leve', desc: 'Filtro Anti-Ego: Remove ruído subjetivo. Latência <1ms.' },
    { val: 2, label: 'Puro', desc: 'Sinal Puro: Processamento RAW_STATE via ONNX. Latência <12ms.' },
    { val: 3, label: 'Chronovisor', desc: 'Ether Chronovisor: Reconstrução sensorial via coordenadas. Latência <50ms.' },
  ];

  const handleSelect = (val: DepthLevel) => {
    setDepth(val);
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0]">Protocol Depth</span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#a0a0a0]">{levels[depth-1].label} 0{depth}</span>
      </div>
      
      <div className="flex w-full pt-2 gap-1 rounded border border-[#333] bg-[#0a0a0a] p-1 overflow-hidden" role="radiogroup">
        {levels.map((l) => (
          <button
            key={l.val}
            onClick={() => handleSelect(l.val)}
            tabIndex={2}
            role="radio"
            aria-checked={depth === l.val}
            title={l.desc}
            className={cn(
              "flex-1 min-h-[48px] flex items-center justify-center text-xs font-bold uppercase transition-colors duration-100 rounded touch-manipulation px-2 cursor-pointer group relative",
              depth === l.val 
                ? "bg-[#333] text-[#fff]" 
                : "bg-[#1a1a1a] text-[#888] hover:bg-[#2a2a2a]"
            )}
            style={{ touchAction: 'manipulation' }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
});
