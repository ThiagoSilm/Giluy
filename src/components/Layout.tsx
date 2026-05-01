import React from 'react';
import { useStore } from '../store/useStore';
import { Shield, Info, History as HistoryIcon, Terminal, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode, openConfig: () => void }> = ({ children, openConfig }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif italic tracking-wider">גִּלּוּי</span>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 hidden sm:block">
              Giluy Protocol v5.0
            </span>
          </div>
          <nav className="flex items-center gap-6">
             <button onClick={openConfig} className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                <Settings size={12} />
                <span className="hidden sm:inline">API</span>
             </button>
             <button className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
               <Shield size={12} />
               <span className="hidden sm:inline">Purity Check</span>
             </button>
             <button className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
               <Terminal size={12} />
               <span className="hidden sm:inline">Logs</span>
             </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 p-6 opacity-30 text-[9px] uppercase tracking-[0.3em]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span>Decentralized Truth Extraction — No Persistence</span>
          <span>Zero Telemetria — Pure Signal Only</span>
          <span>© 2026 גִּלּוּי Protocol</span>
        </div>
      </footer>
    </div>
  );
};
