
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: keyof typeof LucideIcons;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) return null;
  return <LucideIcon className={className} size={size} />;
};
