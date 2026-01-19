
import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "brutalist-border brutalist-shadow active:brutalist-shadow-active transition-all duration-75 px-6 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#FFF500] hover:bg-[#e6dd00]",
    secondary: "bg-white hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
