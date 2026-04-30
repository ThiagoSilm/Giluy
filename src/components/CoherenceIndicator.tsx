import React from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export const CoherenceIndicator: React.FC = () => {
  const { result } = useStore();
  const data = result?.signalData;

  if (!data) return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] opacity-20">
      <span className="text-[10px] uppercase tracking-[0.2em]">Signal Offline</span>
    </div>
  );

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex flex-col gap-6 backdrop-blur-md">
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Progress Circle Backdrop */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/5"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * data.pt) / 100}
              className="text-white transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-mono font-light">{Math.round(data.pt)}%</span>
            <span className="text-[8px] uppercase tracking-widest opacity-40">Coherence</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <MetricRow label="Transmission" value={data.transmission} />
        <MetricRow label="Amplitude" value={data.amplitude} />
        <MetricRow label="Connectivity" value={data.connectivity} />
        <MetricRow label="Dissipation" value={data.dissipation} invert />
      </div>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: number; invert?: boolean }> = ({ label, value, invert }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest opacity-40">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
      <div 
        className={cn(
          "h-full transition-all duration-1000",
          invert ? "bg-rose-500/50" : "bg-white/40"
        )}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  </div>
);
