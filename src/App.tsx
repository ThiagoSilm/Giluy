/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputBox } from './components/InputBox';
import { DepthSlider } from './components/DepthSlider';
import { OutputPanel } from './components/OutputPanel';
import { History } from './components/History';
import { useStore } from './store/useStore';
import { Sparkles, Info, ShieldAlert, Cpu, Download, CheckCircle, Loader2, ArrowDown } from 'lucide-react';
import { cn } from './lib/utils';
import { useProcess } from './hooks/useProcess';

export default function App() {
  const error = useStore(state => state.error);
  const modelStatus = useStore(state => state.modelStatus);
  const modelProgress = useStore(state => state.modelProgress);
  const llmSupported = useStore(state => state.llmSupported);
  const result = useStore(state => state.result);
  const state = useStore(state => state.state);
  
  const { loadModel } = useProcess();
  const scrollRef = useRef<HTMLElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    const hasOverflow = scrollHeight > clientHeight;
    setShowScrollBtn(hasOverflow && !isAtBottom && !!result);
  };

  useEffect(() => {
     // Re-check after a brief delay when state changes (e.g., rendering completes)
     if (state === 'idle') {
        const timer = setTimeout(handleScroll, 150);
        return () => clearTimeout(timer);
     }
  }, [state, result]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full min-h-0 w-full relative">
        <section className="flex-shrink-0 flex flex-col gap-6 p-4 md:p-8 bg-[#0a0a0a] z-10">
          {/* Hero Section */}
          <div className="flex flex-between items-start gap-4">
             <div className="flex flex-col gap-2 max-w-2xl">
               <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight leading-none">
                 Pure Signal <br />
                 <span className="text-[#a0a0a0]">in the desert of data.</span>
               </h1>
               <p className="text-sm text-[#a0a0a0] max-w-md leading-relaxed mt-2">
                 גִּלּוּי (Giluy) is a protocol for truth extraction. 
                 Powered by a purely deterministic Logic Engine (Layer 1) with optional <span className="text-[#a0a0a0] underline decoration-[#e0e0e0]/10">ONNX-based Surgical Classifiers</span> (Layer 2) locally. 100% offline.
               </p>
            </div>

            <div className="ml-auto flex flex-col items-end gap-2">
              <div className={cn(
                "max-w-xs px-3 py-1.5 rounded-full border flex flex-col items-start gap-1 transition-all duration-500",
                modelStatus === 'ready' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                modelStatus === 'loading' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                "bg-white/5 border-[#e0e0e0]/10 text-[#a0a0a0]"
              )}>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    {modelStatus === 'ready' ? <CheckCircle size={12} /> :
                     modelStatus === 'loading' ? <Loader2 size={12} className="animate-spin min-w-3" /> :
                     <Cpu size={12} />}
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      {modelStatus === 'ready' ? `Core Logic: Online${llmSupported ? ' | LLM Accelerator: Online' : ' | LLM: Offline'}` : 
                       modelStatus === 'loading' ? 'Initializing Core Logic...' : 
                       'System: Offline'}
                    </span>
                  </div>
                </div>
                {modelStatus === 'loading' && modelProgress && (
                  <span className="text-[9px] text-amber-400/60 leading-tight block ml-5">
                    {modelProgress}
                  </span>
                )}
              </div>
              
              {modelStatus === 'none' && (
                <button 
                  onClick={() => loadModel()}
                  className="text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 px-4 min-h-[48px] bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
                >
                  <Download size={10} />
                  Activate Kernel & Models (~40MB)
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
               <ShieldAlert className="text-rose-500 mt-0.5" size={18} />
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-rose-500">System Error</span>
                 <span className="text-xs text-rose-200/60">{error}</span>
               </div>
            </div>
          )}

          {/* Control Layer */}
          <div className="flex flex-col gap-6 items-start w-full max-w-[720px] mx-auto">
            <DepthSlider />
            <InputBox />
          </div>
        </section>

        {/* Output Layer */}
        <section 
          id="output-container"
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 flex flex-col min-h-0 @container px-4 md:px-8 pb-8 relative overflow-y-auto custom-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="pt-8">
            <OutputPanel />
          </div>
          <div className="mt-8">
            <History />
          </div>
          {/* About / Manifesto Section (Subtle) */}
          <div className="mt-20 py-20 border-t border-white/5 opacity-40">
            <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
               <h3 className="text-lg font-serif italic italic">The Axiom of Giluy</h3>
               <p className="text-xs leading-relaxed tracking-wider italic">
                 "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth."
                 <br />
                 <span className="not-italic text-[10px] uppercase opacity-50 block mt-4">— Marcus Aurelius</span>
               </p>
               <p className="text-[10px] leading-relaxed uppercase tracking-[0.2em] max-w-sm mx-auto">
                 Giluy attempts to automate the stoic filter, removing the interpreter to find the interpreted.
               </p>
            </div>
          </div>
        </section>

        {/* Scroll to Result Button */}
        <button
          onClick={scrollToBottom}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 min-h-[48px] px-6 rounded-full bg-[#e0e0e0] text-[#0a0a0a] font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-black/50 transition-all duration-300 z-50",
            showScrollBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
          )}
        >
          <span>Rolar para Resultado</span>
          <ArrowDown size={14} />
        </button>
      </div>
    </Layout>
  );
}
