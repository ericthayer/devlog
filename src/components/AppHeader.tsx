
import React from 'react';
import { Icon } from './Icon';
import { BrutalistButton } from './BrutalistButton';
import { AppView } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AppHeaderProps {
  activeView: AppView;
  isUploadOpen: boolean;
  isSettingsOpen: boolean;
  hasAssets: boolean;
  onToggleUpload: () => void;
  onToggleSettings: () => void;
  onBack?: () => void;
  onNavigateToUserManagement?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeView,
  isUploadOpen,
  isSettingsOpen,
  hasAssets,
  onToggleUpload,
  onToggleSettings,
  onBack,
  onNavigateToUserManagement
}) => {
  const { user, signOut } = useAuth();

  const getViewTitle = () => {
    switch (activeView) {
      case 'timeline': return 'Dev_Timeline';
      case 'article': return 'Contribution_Detail';
      case 'editor': return 'Editor_Core';
      case 'user-management': return 'User_Management';
      default: return 'System_Node';
    }
  };

  return (
    <header className="sticky top-0 bg-white border-b-4 border-black p-4 md:p-6 z-40 flex justify-between items-center">
      <div className="flex items-center gap-6">
        {onBack && (
          <button
            onClick={onBack}
            className="hidden items-center gap-3 font-black uppercase hover:translate-x-[-4px] transition-transform group"
          >
            <div className="bg-black text-white p-2 group-hover:bg-amber-300 group-hover:text-black transition-colors brutalist-border">
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
            <span className="mono text-[8px] font-bold bg-black text-amber-300 px-1.5 py-0.5 uppercase tracking-widest">
              SECURE_LINK: {activeView.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:gap-4 items-center">
        {user && (
          <div className="hidden md:flex items-center gap-2 bg-black text-amber-300 px-3 py-2 brutalist-border">
            <span className="mono text-xs font-bold">{user.role.toUpperCase()}</span>
            <span className="text-white">•</span>
            <span className="mono text-xs">{user.email}</span>
          </div>
        )}

        {user?.role === 'super_admin' && onNavigateToUserManagement && (
          <BrutalistButton
            variant={activeView === 'user-management' ? 'primary' : 'secondary'}
            onClick={onNavigateToUserManagement}
            title="User Management"
            className={`text-sm py-2 px-6 hover:brutalist-shadow-active hover:-translate-y-1 transition-all brutalist-shadow-sm ${activeView === 'user-management' ? 'bg-amber-300' : ''}`}
          >
            <Icon name="Users" size={24} />
          </BrutalistButton>
        )}

        <BrutalistButton
          variant="secondary"
          onClick={signOut}
          title="Sign Out"
          className="text-sm py-2 px-4 hover:bg-red-600 hover:text-white transition-colors"
        >
          <Icon name="LogOut" size={20} />
        </BrutalistButton>

        <BrutalistButton
          variant={isSettingsOpen ? 'primary' : 'secondary'}
          onClick={onToggleSettings}
          title="Global Settings"
          className={`text-sm py-2 px-6 hover:brutalist-shadow-active hover:-translate-y-1 transition-all brutalist-shadow-sm ${isSettingsOpen ? 'bg-amber-300' : ''}`}
        >
          <Icon name="Settings" size={24} />
        </BrutalistButton>

        <div className="relative">
          <BrutalistButton
            variant={isUploadOpen ? 'primary' : 'secondary'}
            onClick={onToggleUpload}
            className={`text-sm py-2 px-6 hover:brutalist-shadow-active hover:-translate-y-1 transition-all brutalist-shadow-sm relative ${isUploadOpen ? 'bg-amber-300' : ''}`}
          >
            <Icon name="Zap" size={24} />
          </BrutalistButton>

          {hasAssets && !isUploadOpen && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 z-50 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-6 w-6 brutalist-bg-highlight border-[3px] border-black"></span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};