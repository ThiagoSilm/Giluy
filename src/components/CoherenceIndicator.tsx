import React, { memo } from 'react';
import { useStore } from '../store/useStore';

export const CoherenceIndicator: React.FC = memo(() => {
  const result = useStore(state => state.result);
  const data = result?.signalData;

  if (!data) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end">
         <span className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">Coherence P(t)</span>
         <span className="text-[10px] font-mono text-[#e0e0e0]">{Math.round(data.pt)}%</span>
      </div>
      <div className="relative w-full h-[4px] rounded-full bg-gradient-to-r from-[#ff4444] via-[#ffaa00] to-[#44ff44]">
         <div 
           className="absolute top-[-6px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#e0e0e0] transform -translate-x-1/2"
           style={{ left: `${Math.max(0, Math.min(100, data.pt))}%` }}
         />
      </div>
    </div>
  );
});
