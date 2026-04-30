import React, { useRef, useEffect, memo } from 'react';
import { useStore } from '../store/useStore';
import { useProcess } from '../hooks/useProcess';
import { Send, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export const InputBox: React.FC = memo(() => {
  const input = useStore(state => state.input);
  const setInput = useStore(state => state.setInput);
  const state = useStore(state => state.state);
  const { processText } = useProcess();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="flex flex-col w-full gap-4">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Inject text for revelation... Remove the ego. Find the signal."
        className="input-box custom-scrollbar leading-relaxed font-sans"
        disabled={state === 'processing'}
        tabIndex={1}
        style={{ overflowY: input.length > 0 && textareaRef.current && textareaRef.current.scrollHeight > 200 ? 'auto' : 'hidden' }}
      />
      
      <div className="flex justify-between items-center w-full max-w-[720px] mx-auto gap-4 flex-wrap sm:flex-nowrap">
        <button tabIndex={2} className="text-[#888] hover:text-[#e0e0e0] transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center rounded border border-transparent hover:border-[#333]" title="Upload Document">
          <FileText size={18} />
        </button>
        
        <button
          onClick={() => processText()}
          disabled={state === 'processing' || !input.trim()}
          tabIndex={3}
          className="btn-primary flex-1 sm:flex-none uppercase text-xs tracking-widest font-bold"
        >
          {state === 'processing' ? (
            <div className="spinner !w-4 !h-4 !border-2 !border-t-[#e0e0e0]" style={{ borderRightColor: 'rgba(255,255,255,0.1)', borderBottomColor: 'rgba(255,255,255,0.1)', borderLeftColor: 'rgba(255,255,255,0.1)' }} />
          ) : (
            <>
              <Send size={14} />
              Execute
            </>
          )}
        </button>
      </div>
    </div>
  );
});
