import React from 'react';
import { useStore } from '../store/useStore';
import { useProcess } from '../hooks/useProcess';
import { Sparkles, Send, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export const InputBox: React.FC = () => {
  const { input, setInput, state } = useStore();
  const { processText } = useProcess();

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Inject text for revelation... Remove the ego. Find the signal."
          className="w-full min-h-[200px] p-6 bg-transparent text-white placeholder:text-white/20 focus:outline-none resize-none font-sans leading-relaxed text-lg"
          disabled={state === 'processing'}
        />
        
        <div className="border-t border-white/5 p-4 flex justify-between items-center bg-white/[0.02]">
          <div className="flex gap-4">
            <button className="text-white/40 hover:text-white transition-colors" title="Upload Document">
              <FileText size={18} />
            </button>
          </div>
          
          <button
            onClick={() => processText()}
            disabled={state === 'processing' || !input.trim()}
            className={cn(
              "px-6 py-2 rounded-full flex items-center gap-2 text-xs uppercase tracking-widest transition-all duration-300",
              state === 'processing' 
                ? "bg-white/5 text-white/20 cursor-wait" 
                : "bg-white text-black hover:bg-white/90 active:scale-95"
            )}
          >
            {state === 'processing' ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send size={14} />
                Execute
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
