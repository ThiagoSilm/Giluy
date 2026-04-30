import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface OutputPanelProps {
  content: string;
  onExport: () => void;
}

export const OutputPanel = ({ content, onExport }: OutputPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-surface border border-border overflow-hidden">
      <div 
        role="region" 
        aria-live="polite"
        className="flex-1 overflow-y-auto p-3 font-mono text-[14px] leading-relaxed output-scroll whitespace-pre-wrap select-text"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {content || <span className="opacity-20 italic">Waiting for signal...</span>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-[48px] flex items-center justify-end px-3 gap-2 border-t border-border bg-black/20">
        <button
          onClick={onExport}
          className="h-[44px] px-4 flex items-center gap-2 text-[11px] font-bold text-text-secondary hover:text-white transition-colors"
          aria-label="Export result"
        >
          <Download size={16} />
          <span className="hidden min-[360px]:inline">EXPORT</span>
        </button>
        <button
          onClick={handleCopy}
          className="h-[44px] px-4 flex items-center gap-2 text-[11px] font-bold text-text-secondary hover:text-white transition-colors"
          aria-label="Copy result"
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          <span className="hidden min-[360px]:inline">{copied ? "COPIED" : "COPY"}</span>
        </button>
      </div>
    </div>
  );
};
