import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  icon: LucideIcon;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  badgeText?: string | number;
  badgeVariant?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'gray';
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  title,
  subtitle,
  badgeText,
  badgeVariant = 'blue',
  actions,
  children,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'purple':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400';
      case 'amber':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400';
      case 'rose':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400';
      case 'gray':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400';
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#101827] border border-gray-200 dark:border-gray-800/80 shadow-xs space-y-3 sm:space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${iconBgColor}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>{title}</span>
              {badgeText !== undefined && badgeText !== null && (
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${getBadgeStyle()}`}>
                  {badgeText}
                </span>
              )}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
