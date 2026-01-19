
import React from 'react';
import { Icon } from './Icon';

interface ProcessingStatusProps {
  progress: number;
  onExpand: () => void;
  onCancel: () => void;
  variant?: 'floating' | 'inline';
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  progress, 
  onExpand, 
  onCancel,
  variant = 'floating'
}) => {
  return (
    <div className={`bg-[#FFF500] brutalist-border p-4 brutalist-shadow-sm flex items-center gap-4 pointer-events-auto animate-in ${
      variant === 'floating' 
        ? 'slide-in-from-bottom-full md:slide-in-from-right-full' 
        : 'fade-in'
    }`}>
      <div className="bg-black p-2">
        <Icon name="Cpu" size={24} className="text-[#FFF500] animate-spin" />
      </div>
      <div className="flex flex-col min-w-[160px]">
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-black uppercase italic leading-none">Processing</span>
          <span className="mono text-[10px] font-black">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-black/10 mb-2 border-2 border-black overflow-hidden bg-white">
          <div 
            className="h-full bg-black transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onExpand} 
            className="mono text-[9px] font-bold uppercase underline hover:no-underline"
            style={{ pointerEvents: 'auto' }}
          >
            Expand
          </button>
          <span className="text-black/40">/</span>
          <button 
            onClick={onCancel} 
            className="mono text-[9px] font-bold uppercase underline hover:no-underline text-red-600"
            style={{ pointerEvents: 'auto' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
