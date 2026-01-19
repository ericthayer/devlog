
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';

interface SettingsViewProps {
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClearData }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-6 border-b-4 border-black bg-white flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase italic leading-none">Global_Matrix</h3>
          <p className="mono text-[8px] font-bold mt-1 opacity-60">SYSTEM CONFIGURATION & MAINTENANCE</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 brutalist-border hover:bg-gray-50 transition-colors bg-white">
            <div className="flex items-center gap-3">
              <Icon name="Repeat" size={20} />
              <span className="font-black uppercase italic text-xs">AI Auto-Rename</span>
            </div>
            <div className="w-12 h-6 bg-black relative border-2 border-black cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-[#FFF500] border-2 border-black" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 brutalist-border hover:bg-gray-50 transition-colors bg-white">
            <div className="flex items-center gap-3">
              <Icon name="Rss" size={20} />
              <span className="font-black uppercase italic text-xs">Live RSS Feed</span>
            </div>
            <span className="mono text-[8px] font-black bg-black text-white px-2 py-1 uppercase">Disabled</span>
          </div>

          <div className="flex items-center justify-between p-4 brutalist-border bg-gray-50">
            <div className="flex items-center gap-3">
              <Icon name="HardDrive" size={20} />
              <span className="font-black uppercase italic text-xs">PWA Cache</span>
            </div>
            <span className="mono text-[8px] font-black text-green-600 underline uppercase italic">Healthy</span>
          </div>
        </div>

        <div className="pt-6 border-t-4 border-black border-dotted">
          <h4 className="font-black uppercase text-xs mb-4 text-red-500 italic">Danger Zone</h4>
          <div className="bg-red-50 p-4 brutalist-border border-red-500 mb-4">
            <p className="mono text-[9px] text-red-700 leading-tight uppercase font-bold">
              Purging will permanently delete all local intelligence records, case studies, and artifact links. This cannot be undone.
            </p>
          </div>
          <BrutalistButton variant="danger" fullWidth className="py-3 text-xs" onClick={onClearData}>
            Purge All Intelligence
          </BrutalistButton>
        </div>
      </div>

      <div className="p-6 border-t-4 border-black bg-white mt-auto">
        <div className="flex items-center gap-3 justify-center text-zinc-400">
          <Icon name="ShieldCheck" size={16} />
          <span className="mono text-[8px] font-black uppercase">End-to-End Encrypted Node</span>
        </div>
      </div>
    </div>
  );
};
