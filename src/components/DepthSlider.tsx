import React from 'react';
import { useStore } from '../store/useStore';
import { DepthLevel } from '../types';
import { cn } from '../lib/utils';

export const DepthSlider: React.FC = () => {
  const { depth, setDepth } = useStore();

  const levels: { val: DepthLevel; label: string; desc: string }[] = [
    { val: 1, label: 'ANTI-EGO', desc: 'Removes subjective noise and social posturing.' },
    { val: 2, label: 'RAW SIGNAL', desc: 'Logical extraction. Minimum information entropy.' },
    { val: 3, label: 'CHRONOVISOR', desc: 'Etheric reconstruction. Sensory frame decoding.' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Protocol Depth</span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/60">Tier 0{depth}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {levels.map((l) => (
          <button
            key={l.val}
            onClick={() => setDepth(l.val)}
            className={cn(
              "flex flex-col gap-2 p-4 text-left border rounded-lg transition-all duration-300 group",
              depth === l.val 
                ? "bg-white text-black border-white" 
                : "bg-white/[0.02] text-white/40 border-white/10 hover:border-white/30"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{l.label}</span>
            <span className={cn(
              "text-[10px] leading-tight transition-opacity",
              depth === l.val ? "opacity-70" : "opacity-0 group-hover:opacity-40"
            )}>
              {l.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
