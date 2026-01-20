
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { AppView } from '../types';

interface AppHeaderProps {
  activeView: AppView;
  isUploadOpen: boolean;
  isSettingsOpen: boolean;
  hasAssets: boolean;
  onToggleUpload: () => void;
  onToggleSettings: () => void;
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  activeView, 
  isUploadOpen,
  isSettingsOpen,
  hasAssets,
  onToggleUpload,
  onToggleSettings,
  onBack 
}) => {
  const getViewTitle = () => {
    switch (activeView) {
      case 'timeline': return 'Contributions';
      case 'article': return 'Contribution_Detail';
      case 'editor': return 'Editor_Core';
      default: return 'System_Node';
    }
  };

  return (
    <header className="sticky top-0 bg-white border-b-4 border-black p-4 md:p-6 z-40 flex justify-between items-center">
      <div className="flex items-center gap-6">
        {onBack && (
          <button 
            onClick={onBack} 
            className="flex items-center gap-3 font-black uppercase hover:translate-x-[-4px] transition-transform group"
          >
            <div className="bg-black text-white p-2 group-hover:bg-[#FFF500] group-hover:text-black transition-colors brutalist-border">
              <Icon name="ArrowLeft" size={18} />
            </div>
            <span className="mono text-[10px] font-black hidden sm:inline">Back_Return</span>
          </button>
        )}
        <div>
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
            {getViewTitle()}
          </h2>
          <div className="flex gap-2 mt-1">
            <span className="mono text-[8px] font-bold bg-black text-[#FFF500] px-1.5 py-0.5 uppercase tracking-widest">
              SECURE_LINK: {activeView.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:gap-4 items-center">
         <BrutalistButton 
          variant={isSettingsOpen ? 'primary' : 'secondary'} 
          onClick={onToggleSettings}
          title="Global Settings"
          className={`text-sm py-2 px-6 transition-colors brutalist-shadow-sm ${isSettingsOpen ? 'bg-[#FFF500]' : ''}`}
        >
          <Icon name="Settings" size={18} />
        </BrutalistButton>

        <div className="relative">
          <BrutalistButton 
            variant={isUploadOpen ? 'primary' : 'secondary'} 
            onClick={onToggleUpload} 
            className={`text-sm py-2 px-6 transition-colors brutalist-shadow-sm relative ${isUploadOpen ? 'bg-[#FFF500]' : ''}`}
          >
            <Icon name="Zap" size={18} />
          </BrutalistButton>
          
          {/* Pulsing Notification Badge - Only shows when assets are ready to submit and drawer is closed */}
          {hasAssets && !isUploadOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 z-50 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-black"></span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
