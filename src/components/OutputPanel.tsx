import React from 'react';
import { useStore } from '../store/useStore';
import { Download, Copy, Share2, Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';
import { CoherenceIndicator } from './CoherenceIndicator';

export const OutputPanel: React.FC = () => {
  const { result, state } = useStore();

  if (state === 'idle' && !result) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2">
           <Hexagon size={16} className="text-white/40" />
           <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Extracted Signal P(t)</span>
         </div>
         <div className="flex gap-4">
           <button 
             onClick={() => result && navigator.clipboard.writeText(result.output)}
             className="text-white/40 hover:text-white transition-colors" title="Copy Content"
            >
             <Copy size={16} />
           </button>
           <button className="text-white/40 hover:text-white transition-colors" title="Download Record">
             <Download size={16} />
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 min-h-[300px] relative overflow-hidden backdrop-blur-sm">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="relative">
            <p className={cn(
              "font-serif text-xl leading-relaxed whitespace-pre-wrap transition-opacity duration-500",
              state === 'processing' ? "opacity-20" : "opacity-100"
            )}>
              {result?.output || "Awaiting signal parameters..."}
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
           <CoherenceIndicator />
           
           <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Protocol Meta</span>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="opacity-40">MODE:</span>
                  <span className="text-white/80">{result?.mode || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">TIMESTAMP:</span>
                  <span className="text-white/80">{result?.timestamp ? new Date(result.timestamp).toLocaleTimeString() : '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">GAIN (ΔPt):</span>
                  <span className={cn(
                    "font-bold",
                    (result?.coherenceGain ?? 0) > 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {result?.coherenceGain ? `${result.coherenceGain > 0 ? '+' : ''}${result.coherenceGain}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">STATUS:</span>
                  <span className="text-emerald-400/80">REVELATION_ACTIVE</span>
                </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};
