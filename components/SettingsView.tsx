
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { SettingsItem } from './SettingsItem';
import { UserPreferences } from '../types';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  preferences, 
  onUpdatePreferences, 
  onClearData 
}) => {
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
          <SettingsItem 
            icon="Palette" 
            label="Visual_Theme" 
            description={`Current: ${preferences.theme}`}
          >
            <div className="flex brutalist-border bg-black p-0.5">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdatePreferences({ theme: t })}
                  className={`px-3 py-1 text-[9px] font-black uppercase transition-all ${
                    preferences.theme === t 
                      ? 'bg-amber-300 text-black' 
                      : 'bg-black text-white hover:text-amber-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingsItem>

          <SettingsItem 
            icon="FileJson" 
            label="Export_Format" 
            description="Default download type"
          >
            <div className="flex brutalist-border bg-black p-0.5">
              {(['markdown', 'json'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onUpdatePreferences({ exportFormat: f })}
                  className={`px-3 py-1 text-[9px] font-black uppercase transition-all ${
                    preferences.exportFormat === f 
                      ? 'bg-amber-300 text-black' 
                      : 'bg-black text-white hover:text-amber-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </SettingsItem>

          <SettingsItem 
            icon="Repeat" 
            label="AI Auto-Rename" 
            description="Process filenames on upload"
          >
            <button 
              onClick={() => onUpdatePreferences({ autoRename: !preferences.autoRename })}
              className={`w-12 h-6 brutalist-border relative transition-all ${preferences.autoRename ? 'bg-black' : 'bg-zinc-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 transition-all brutalist-border ${
                preferences.autoRename ? 'right-0.5 bg-amber-300' : 'left-0.5 bg-white'
              }`} />
            </button>
          </SettingsItem>

          <SettingsItem 
            icon="HardDrive" 
            label="PWA Cache" 
            description="Asset persistence status"
          >
            <span className="mono text-[8px] font-black text-green-600 underline uppercase italic">Healthy</span>
          </SettingsItem>
        </div>

        <div className="pt-6 border-t-4 border-black border-dotted">
          <h4 className="font-black uppercase text-xs mb-4 text-red-500 italic">Danger Zone</h4>
          <div className="bg-red-50 p-4 brutalist-border border-red-500 mb-4">
            <p className="mono text-[9px] text-red-700 leading-tight uppercase font-bold">
              Purging will permanently delete all local intelligence records, case studies, and artifact links. This cannot be undone.
            </p>
          </div>
          <BrutalistButton variant="danger" fullWidth className="py-6 text-sm" onClick={onClearData}>
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