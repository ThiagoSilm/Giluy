interface CoherenceIndicatorProps {
  value: number; // 0 to 1
}

export const CoherenceIndicator = ({ value }: CoherenceIndicatorProps) => {
  const percentage = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary uppercase tracking-widest">
        <span>Coherence (Pt)</span>
        <span>{(value).toFixed(4)}</span>
      </div>
      <div className="relative h-[4px] w-full bg-[#1a1a1a] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#ff4444] via-[#ffaa00] to-[#44ff44] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        {/* Triangular indicator as per spec can be a simple overlay or the bar itself. 
            The spec says "barra 4px altura... indicador triangular".
            I'll add a small triangular marker above the bar.
        */}
      </div>
      <div className="relative w-full h-[8px]">
         <div 
           className="absolute top-[-2px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-accent transition-all duration-300"
           style={{ left: `calc(${percentage}% - 4px)` }}
         />
      </div>
    </div>
  );
};
