'use client';

import React from 'react';
import { BRAND } from '../../lib/branding';
import Image from 'next/image';

interface LogoProps {
  variant?: 'icon' | 'horizontal';
  theme?: 'light' | 'dark' | 'auto';
  size?: number;
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'auto',
  size = 32,
  className = '',
  showTagline = false,
}) => {
  const iconSize = size;

  // Orbit Icon (Vector SVG with planetary orbit ring & nucleus)
  const IconSvg = (
    <>

      <Image
        src="/logos/orbit-light-icon.png"
        alt="Orbit Logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0 dark:hidden"
      />

      <Image
        src="/logos/orbit-dark-icon.svg"
        alt="Orbit Logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0 hidden dark:block"
      />
    </>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {IconSvg}
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white leading-none ${BRAND.tagline.length > 0 ? 'text-xl' : 'text-lg'}`}>
          {BRAND.name}
        </span>
        {showTagline && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
};
