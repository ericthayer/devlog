
import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, children, width = 'w-[450px]' }) => {
  return (
    <aside 
      className={`h-full bg-white border-l-4 border-black transition-all duration-500 ease-in-out overflow-hidden flex flex-col shrink-0 ${
        isOpen ? width : 'w-0 border-l-0'
      }`}
    >
      <div className={`${width} h-full flex flex-col overflow-y-auto no-scrollbar`}>
        {children}
      </div>
    </aside>
  );
};
