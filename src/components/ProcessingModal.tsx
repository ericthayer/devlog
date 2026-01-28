
import React from 'react';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';

interface ProcessingModalProps {
  isMinimized: boolean;
  isThinkingEnabled: boolean;
  step: 'analyzing' | 'generating' | 'finalizing';
  progress: number;
  onMinimize: (min: boolean) => void;
  onCancel: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isMinimized,
  isThinkingEnabled,
  step,
  progress,
  onMinimize,
  onCancel
}) => {
  if (isMinimized) return null;

  const stepLabels = {
    analyzing: 'Analyzing Artifacts',
    generating: 'Generating Case Study',
    finalizing: 'Formatting Final Output'
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-amber-300 brutalist-border p-12 md:p-20 brutalist-shadow text-center max-w-xl w-full relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => onMinimize(true)}
            className="p-2 bg-black text-white hover:bg-zinc-800 transition-colors brutalist-border"
            title="Minimize to Background"
          >
            <Icon name="Minimize2" size={18} />
          </button>
          <button 
            onClick={onCancel}
            className="p-2 bg-red-600 text-white hover:bg-red-700 transition-colors brutalist-border"
            title="Cancel Operation"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="relative inline-block mb-12">
          <Icon name="Cpu" size={80} className="animate-spin text-black" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-black animate-ping" />
          </div>
        </div>

        <div className="mb-10 space-y-2">
          <h3 className="text-4xl font-black uppercase italic leading-tight">
            {isThinkingEnabled ? 'Deep Intelligence Engaged...' : 'Gemini Thinking...'}
          </h3>
          <div className="mono text-[10px] font-bold tracking-[0.3em] opacity-60 uppercase">
            SYSTEM_MODE: {isThinkingEnabled ? 'GEMINI_3_PRO_MAX_REASONING' : 'STANDARD_SYNTHESIS'}
          </div>
        </div>

        <div className="mb-12">
          <ProgressBar progress={progress} label={stepLabels[step]} />
        </div>

        <div className="grid grid-cols-3 gap-2 mono text-[9px] font-black uppercase mb-12">
          <div className={`p-2 border-2 ${step === 'analyzing' ? 'bg-black text-white' : 'border-black/20 text-black/40'}`}>01_PARSE</div>
          <div className={`p-2 border-2 ${step === 'generating' ? 'bg-black text-white' : 'border-black/20 text-black/40'}`}>02_SYNTH</div>
          <div className={`p-2 border-2 ${step === 'finalizing' ? 'bg-black text-white' : 'border-black/20 text-black/40'}`}>03_FORMAT</div>
        </div>

        <div className="pt-8 border-t-2 border-black/10">
          <button 
            onClick={() => onMinimize(true)}
            className="mono text-xs font-black uppercase underline hover:no-underline hover:text-black/60 transition-colors"
          >
            Continue working in background
          </button>
        </div>
      </div>
    </div>
  );
};