import React from 'react';
import { useStore } from '../store/useStore';
import { History as HistoryIcon, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const History: React.FC = () => {
  const { history, clearHistory, setResult, setInput, setDepth } = useStore();

  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 py-12 border-t border-white/5 opacity-80">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <HistoryIcon size={14} className="opacity-40" />
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Previous Revelations</span>
        </div>
        <button 
          onClick={clearHistory}
          className="text-[9px] uppercase tracking-widest text-rose-400/60 hover:text-rose-400 transition-colors flex items-center gap-2"
        >
          <Trash2 size={12} />
          Wipe Cache
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setResult(item);
              setInput(item.input);
              setDepth(item.level);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="flex flex-col gap-3 p-6 bg-white/[0.02] border border-white/10 rounded-xl text-left hover:bg-white/[0.05] transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Tier 0{item.level} — {item.mode}</span>
              <span className="text-[9px] opacity-20 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
            
            <p className="text-sm text-white/60 line-clamp-2 font-serif italic">
              {item.output}
            </p>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
               <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-white/20" style={{ width: `${item.outputPt}%` }} />
               </div>
               <span className="text-[8px] font-mono opacity-40">{Math.round(item.outputPt)}% PT</span>
            </div>

            <ChevronRight className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity" size={14} />
          </button>
        ))}
      </div>
    </div>
  );
};
