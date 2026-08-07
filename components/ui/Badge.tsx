'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';
  
  let variantStyles = 'bg-[#1F3B99]/10 text-[#1F3B99] dark:bg-[#6D5BFF]/20 dark:text-[#6D5BFF]';
  
  switch (variant) {
    case 'secondary':
      variantStyles = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      break;
    case 'success':
      variantStyles = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
      break;
    case 'warning':
      variantStyles = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
      break;
    case 'danger':
      variantStyles = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
      break;
    case 'purple':
      variantStyles = 'bg-[#6D5BFF]/10 text-[#6D5BFF] dark:bg-[#6D5BFF]/20 dark:text-[#6D5BFF]';
      break;
    case 'info':
      variantStyles = 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300';
      break;
    case 'outline':
      variantStyles = 'border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 bg-transparent';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full transition-colors ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
