/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layout } from './components/Layout';
import { InputBox } from './components/InputBox';
import { DepthSlider } from './components/DepthSlider';
import { OutputPanel } from './components/OutputPanel';
import { History } from './components/History';
import { useStore } from './store/useStore';
import { Sparkles, Info, ShieldAlert, Cpu, Download, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { useProcess } from './hooks/useProcess';

export default function App() {
  const { error, modelStatus, modelProgress } = useStore();
  const { loadModel } = useProcess();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="flex flex-col gap-6 py-8">
        <div className="flex flex-between items-start gap-4">
          <div className="flex flex-col gap-2 max-w-2xl">
             <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight leading-none">
               Pure Signal <br />
               <span className="text-white/40">in the desert of data.</span>
             </h1>
             <p className="text-sm text-white/40 max-w-md leading-relaxed mt-2">
               גִּלּוּי (Giluy) is a protocol for truth extraction. 
               Powered by WebLLM running Phi-3 locally with <span className="text-white/60 underline decoration-white/10">TurboQuant-JS</span> for zero-latency offline inference.
             </p>
          </div>

          <div className="ml-auto flex flex-col items-end gap-2">
            <div className={cn(
              "max-w-xs px-3 py-1.5 rounded-full border flex flex-col items-start gap-1 transition-all duration-500",
              modelStatus === 'ready' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              modelStatus === 'loading' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-white/5 border-white/10 text-white/40"
            )}>
              <div className="flex items-center gap-2">
                {modelStatus === 'ready' ? <CheckCircle size={12} /> :
                 modelStatus === 'loading' ? <Loader2 size={12} className="animate-spin min-w-3" /> :
                 <Cpu size={12} />}
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {modelStatus === 'ready' ? 'System Offline: Ready' : 
                   modelStatus === 'loading' ? 'Loading Local Model...' : 
                   'Local LLM: Idle'}
                </span>
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
                className="text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5"
              >
                <Download size={10} />
                Activate local engine (~1.5GB)
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
      </section>

      {/* Control Layer */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="flex flex-col gap-8">
          <InputBox />
        </div>
        
        <aside className="flex flex-col gap-8">
          <DepthSlider />
          
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Info size={14} />
              <span className="text-[10px] uppercase tracking-widest">Protocol Instructions</span>
            </div>
            <ul className="text-[10px] leading-relaxed text-white/30 space-y-2 list-disc pl-4">
              <li>Input text is processed locally (no API calls).</li>
              <li>Embeddings are compressed using 4-bit TurboQuant.</li>
              <li>Filter level determines logical exclusion depth.</li>
              <li>IndexedDB handles model persistence offline.</li>
            </ul>
          </div>
        </aside>
      </section>

      {/* Output Layer */}
      <section className="py-8">
        <OutputPanel />
      </section>

      {/* History Layer */}
      <section className="py-8">
        <History />
      </section>

      {/* About / Manifesto Section (Subtle) */}
      <section className="mt-20 py-20 border-t border-white/5 opacity-40">
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
      </section>
    </Layout>
  );
}
