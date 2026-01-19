
import React from 'react';

interface SystemHudProps {
  isUploading: boolean;
}

export const SystemHud: React.FC<SystemHudProps> = ({ isUploading }) => {
  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] pointer-events-none">
      <div className="bg-zinc-600 text-[#FFF500] p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold uppercase italic">
        CPU_LOAD: {isUploading ? '98%' : '2%'} // RAM: 14GB // SYSTEM_ONLINE
      </div>
    </div>
  );
};
