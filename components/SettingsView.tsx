
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';

interface SettingsViewProps {
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClearData }) => {
  return (
    <div className="p-4 md:p-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
      <div className="brutalist-border bg-white p-10 md:p-16 brutalist-shadow">
        <h2 className="text-4xl font-black uppercase mb-10 italic border-b-8 border-black pb-4">Global Matrix</h2>
        <div className="space-y-8">
          <div className="flex items-center justify-between p-5 brutalist-border hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <Icon name="Repeat" />
              <span className="font-black uppercase italic">AI Auto-Rename</span>
            </div>
            <div className="w-14 h-8 bg-black relative rounded-none border-2 border-black cursor-pointer">
              <div className="absolute right-1 top-1 w-5 h-5 bg-[#FFF500] brutalist-border rounded-none" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-5 brutalist-border hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <Icon name="Rss" />
              <span className="font-black uppercase italic">Live RSS Feed</span>
            </div>
            <span className="mono text-xs font-black bg-black text-white px-2 py-1 uppercase">Disabled</span>
          </div>

          <div className="flex items-center justify-between p-5 brutalist-border bg-gray-50">
            <div className="flex items-center gap-4">
              <Icon name="HardDrive" />
              <span className="font-black uppercase italic">PWA Cache</span>
            </div>
            <span className="mono text-xs font-black text-green-600 underline uppercase italic">Healthy</span>
          </div>

          <div className="pt-8 border-t-4 border-black">
            <h4 className="font-black uppercase mb-4 text-red-500">Danger Zone</h4>
            <BrutalistButton variant="danger" fullWidth onClick={onClearData}>
              Purge All Intelligence
            </BrutalistButton>
          </div>
        </div>
      </div>
    </div>
  );
};
