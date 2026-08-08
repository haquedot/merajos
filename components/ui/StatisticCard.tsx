'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatisticCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/50',
  iconColor = 'text-blue-500',
  trend,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
          {title}
        </span>
        <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${iconBgColor}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-1 flex-wrap sm:flex-nowrap">
        <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white truncate">
          {value}
        </h4>
        {trend && (
          <span
            className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
              trend.positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
