import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-medium bg-[#EEF0FD] text-brand border border-[#D5D9F9] rounded-full select-none flex-shrink-0 ${sizeStyles[size]} ${className}`}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};
