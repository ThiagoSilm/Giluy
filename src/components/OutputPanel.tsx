import React, { memo } from 'react';
import { useStore } from '../store/useStore';
import { Copy, Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';
import { CoherenceIndicator } from './CoherenceIndicator';
import { ExportButton } from './ExportButton';

export const OutputPanel: React.FC = memo(() => {
  const result = useStore(state => state.result);
  const state = useStore(state => state.state);

  return (
    <div className="flex flex-col gap-6 min-h-[120px] w-full max-w-[720px] mx-auto">
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2">
           <Hexagon size={16} className="text-[#e0e0e0]/40" />
           <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Extracted Signal P(t)</span>
         </div>
         <div className="flex gap-2 relative">
           <button 
             onClick={() => result && navigator.clipboard.writeText(result.output)}
             className="text-[#e0e0e0]/40 hover:text-[#e0e0e0] transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-lg border border-transparent hover:border-[#333]" title="Copy Content"
             tabIndex={5}
            >
             <Copy size={16} />
           </button>
           <ExportButton />
         </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <CoherenceIndicator />
        <div className="bg-[#0a0a0a] border border-[#333] rounded p-4 sm:p-6 min-h-[120px] relative break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', minHeight: '0' }} tabIndex={4}>
          <div className="relative">
            {state === 'processing' ? (
              <div className="flex items-center justify-center py-12 transition-opacity duration-150">
                <div className="spinner" />
              </div>
            ) : (
              <p className={cn(
                "font-mono text-base leading-relaxed whitespace-pre-wrap transition-opacity duration-150 text-[#e0e0e0]",
                !result ? "opacity-0" : "opacity-100"
              )}>
                {result?.output || ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
