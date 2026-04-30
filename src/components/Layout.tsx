import React, { memo } from 'react';
import { Shield, Terminal } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  return (
    <div className="h-[100dvh] w-full bg-[#0a0a0a] text-[#e0e0e0] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#333] p-4 z-10 bg-[#0a0a0a]">
        <div className="max-w-[720px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif italic tracking-wider">גִּלּוּי</span>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 hidden sm:block">
              Giluy Protocol v5.0
            </span>
          </div>
          <nav className="flex items-center gap-6">
             <button className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 min-h-[48px] px-2">
               <Shield size={12} />
               <span className="hidden sm:inline">Purity Check</span>
             </button>
             <button className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 min-h-[48px] px-2">
               <Terminal size={12} />
               <span className="hidden sm:inline">Logs</span>
             </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[720px] mx-auto flex flex-col min-h-0 p-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-[#333] p-4 opacity-30 text-[9px] uppercase tracking-[0.3em] bg-[#0a0a0a] z-10 hidden sm:block">
        <div className="max-w-[720px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <span>Decentralized Truth Extraction — No Persistence</span>
          <span>Zero Telemetria — Pure Signal Only</span>
          <span>© 2026 גִּלּוּי Protocol</span>
        </div>
      </footer>
    </div>
  );
});
