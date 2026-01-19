
import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const variants = {
    error: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
    info: "bg-[#FFF500] text-black",
  };

  const icons = {
    error: "AlertCircle",
    success: "CheckCircle",
    info: "Info",
  } as const;

  return (
    <div className={`fixed top-6 right-6 z-[1000] p-5 brutalist-border brutalist-shadow flex items-center gap-4 animate-in slide-in-from-right-10 duration-300 ${variants[type]}`}>
      <Icon name={icons[type]} size={24} />
      <div className="flex flex-col">
        <span className="font-black uppercase text-xs mono mb-1">{type}_ALERT</span>
        <p className="font-bold text-sm tracking-tight">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 hover:scale-110 transition-transform"
      >
        <Icon name="X" size={20} />
      </button>
    </div>
  );
};
