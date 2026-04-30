import { FiltrationLevel } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DepthSliderProps {
  level: FiltrationLevel;
  onChange: (level: FiltrationLevel) => void;
}

export const DepthSlider = ({ level, onChange }: DepthSliderProps) => {
  const options = [
    { value: FiltrationLevel.ANTI_EGO, label: "ANTI-EGO" },
    { value: FiltrationLevel.RAW_STATE_PROCESSOR, label: "RAW STATE" },
    { value: FiltrationLevel.ETHER_CHRONOVISOR, label: "CHRONOVISOR" },
  ];

  return (
    <div className="flex flex-col sm:flex-row w-full gap-2 px-3 sm:px-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-label={`Select depth: ${opt.label}`}
          className={cn(
            "h-[44px] flex-1 border transition-all duration-150 text-[11px] font-bold tracking-[0.1em]",
            level === opt.value
              ? "bg-[#333] text-[#fff] border-[#444]"
              : "bg-[#1a1a1a] text-[#888] border-[#222] hover:border-[#333]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
