'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label className={cn('relative inline-flex items-center cursor-pointer select-none', disabled && 'cursor-not-allowed opacity-50')}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'w-4 h-4 rounded-md border transition-all flex items-center justify-center border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-orbit-blue peer-checked:bg-orbit-blue peer-checked:border-orbit-blue text-white shadow-2xs',
            className
          )}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
