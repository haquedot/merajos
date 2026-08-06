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
  
  let variantStyles = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  
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
      variantStyles = 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
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
