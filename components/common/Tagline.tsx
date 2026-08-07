'use client';

import React from 'react';
import { BRAND } from '../../lib/branding';

interface TaglineProps {
  className?: string;
  size?: 'xs' | 'sm' | 'base';
}

export const Tagline: React.FC<TaglineProps> = ({ className = '', size = 'xs' }) => {
  const sizeClasses = {
    xs: 'text-[11px] font-semibold',
    sm: 'text-xs font-semibold',
    base: 'text-sm font-bold',
  };

  return (
    <span className={`text-slate-500 dark:text-slate-400 tracking-normal ${sizeClasses[size]} ${className}`}>
      {BRAND.tagline} ⭐
    </span>
  );
};
