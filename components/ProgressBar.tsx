
import React from 'react';

interface ProgressBarProps {
  progress: number;
  label: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <span className="mono text-[10px] font-black uppercase tracking-widest text-black/60">{label}</span>
        <span className="mono text-[10px] font-black">{Math.round(progress)}%</span>
      </div>
      <div className="h-6 w-full bg-white brutalist-border p-1">
        <div 
          className="h-full bg-black transition-all duration-300 ease-out relative overflow-hidden" 
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
