
import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, children, width = 'w-full md:w-[450px]' }) => {
  return (
    <aside
      className={`absolute top-0 right-0 h-full z-50 bg-white border-l-4 border-black transition-none duration-500 ease-in-out overflow-hidden flex flex-col shadow-2xl min-[1200px]:relative ${isOpen ? width : 'w-0 !border-l-0 opacity-0'
        }`}
    >
      <div className={`${width} h-full flex flex-col overflow-y-auto no-scrollbar`}>
        {children}
      </div>
    </aside>
  );
};
