
import React from 'react';
import { Icon } from './Icon';
import * as LucideIcons from 'lucide-react';

interface SettingsItemProps {
  icon: keyof typeof LucideIcons;
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, description, children }) => {
  return (
    <div className="flex items-center justify-between p-4 brutalist-border bg-white hover:bg-zinc-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="bg-black text-[#FFF500] p-2 brutalist-border">
          <Icon name={icon} size={18} />
        </div>
        <div>
          <span className="font-black uppercase italic text-xs block">{label}</span>
          {description && <span className="mono text-[8px] font-bold opacity-40 uppercase block mt-0.5">{description}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};
