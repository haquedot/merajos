'use client';

import React from 'react';
import { BRAND } from '../../lib/branding';

interface BrandTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandText: React.FC<BrandTextProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-extrabold',
    xl: 'text-3xl font-black',
  };

  return (
    <span className={`tracking-tight text-slate-900 dark:text-white ${sizeClasses[size]} ${className}`}>
      {BRAND.name}
    </span>
  );
};
