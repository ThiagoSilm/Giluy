import React, { memo, useState } from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ExportButton: React.FC = memo(() => {
  const result = useStore(state => state.result);
  const [open, setOpen] = useState(false);

  const handleExport = (format: 'txt' | 'json' | 'pdf') => {
    setOpen(false);
    if (!result) return;
    
    let content = '';
    let type = 'text/plain';
    
    if (format === 'json') {
      content = JSON.stringify(result, null, 2);
      type = 'application/json';
    } else {
      content = result.output;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revelation_${new Date().getTime()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setOpen(!open)}
        className="text-[#e0e0e0]/40 hover:text-[#e0e0e0] transition-colors min-h-[48px] px-4 flex items-center justify-center gap-2 rounded-lg border border-transparent hover:border-[#333]" 
        title="Export Record" 
        tabIndex={6}
      >
        <Download size={16} />
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Exportar</span>
      </button>
      
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded overflow-hidden z-50 flex flex-col w-[120px]">
          <button onClick={() => handleExport('txt')} className="text-xs uppercase px-4 py-3 hover:bg-[#2a2a2a] text-left text-[#e0e0e0]">.TXT</button>
          <button onClick={() => handleExport('json')} className="text-xs uppercase px-4 py-3 hover:bg-[#2a2a2a] text-left text-[#e0e0e0] border-t border-[#333]">.JSON</button>
          <button onClick={() => handleExport('pdf')} className="text-xs uppercase px-4 py-3 hover:bg-[#2a2a2a] text-left text-[#e0e0e0] border-t border-[#333]">.PDF</button>
        </div>
      )}
    </div>
  );
});
