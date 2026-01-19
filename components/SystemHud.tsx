
import React from 'react';

interface SystemHudProps {
  isUploading: boolean;
}

export const SystemHud: React.FC<SystemHudProps> = ({ isUploading }) => {
  return (
    <div className="bg-zinc-600 text-[#FFF500] flex items-center p-4 brutalist-border brutalist-shadow-sm mono text-[10px] font-bold uppercase italic pointer-events-auto">
      CPU_LOAD: {isUploading ? '98%' : '2%'} // RAM: 14GB // SYSTEM_ONLINE
    </div>
  );
};
