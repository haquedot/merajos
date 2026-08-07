'use client';

import React from 'react';
import { Logo } from './Logo';
import { Tagline } from './Tagline';

interface BrandHeaderProps {
  className?: string;
  showTagline?: boolean;
  size?: number;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  className = '',
  showTagline = true,
  size = 36,
}) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Logo variant="horizontal" size={size} showTagline={false} />
      {showTagline && <Tagline size="sm" className="mt-1" />}
    </div>
  );
};
