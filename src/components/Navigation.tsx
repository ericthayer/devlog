
import React from 'react';
import { Icon } from './Icon';
import { AppView, UserRole } from '../types';

interface NavigationProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  userRole?: UserRole | null;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, userRole }) => {
  const navItems: { id: AppView; icon: any; label: string; requiresRole?: UserRole }[] = [
    { id: 'timeline', icon: 'LayoutList', label: 'Feed' },
    { id: 'user-management', icon: 'Users', label: 'Users', requiresRole: 'super_admin' },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresRole) return true;
    return userRole === item.requiresRole;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r-4 border-black flex-col p-8 z-50 overflow-y-auto no-scrollbar">
        <div className="mb-12">
          <h1 className="text-3xl font-black italic tracking-tighter leading-none">
            DEV<br />SIGNER<br />LOG_
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-4 px-4 py-3 brutalist-border text-lg font-bold uppercase transition-all ${activeView === item.id || (activeView === 'article' && item.id === 'timeline')
                ? 'bg-amber-300 brutalist-shadow'
                : 'hover:bg-gray-50'
                }`}
            >
              <Icon name={item.icon} size={24} />
              <span className="mono">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};