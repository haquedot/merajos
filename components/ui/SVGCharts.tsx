'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- Line Chart Component ---
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export const SVGLineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  color = '#3b82f6',
}) => {
  if (!data || data.length === 0) return null;

  const padding = 25;
  const svgWidth = 500;
  const svgHeight = height;

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const minValue = 0;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((d.value - minValue) / (maxValue - minValue)) * (svgHeight - padding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
        {/* Fill Area Gradient */}
        <defs>
          <linearGradient id="line-chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#line-chart-grad)" />

        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              className="fill-white dark:fill-gray-900 stroke-blue-500"
              strokeWidth="2"
            />
            <text
              x={pt.x}
              y={svgHeight - 5}
              textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500 text-[10px] font-medium"
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// --- Bar Chart Component ---
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  maxVal?: number;
}

export const SVGBarChart: React.FC<BarChartProps> = ({
  data,
  height = 180,
  maxVal,
}) => {
  if (!data || data.length === 0) return null;

  const calculatedMax = maxVal || Math.max(...data.map((d) => d.value), 10);

  return (
    <div className="w-full flex items-end justify-between gap-2 pt-4 pb-2" style={{ height }}>
      {data.map((item, idx) => {
        const heightPercent = Math.min(100, Math.max(5, (item.value / calculatedMax) * 100));
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
              {item.value}
            </span>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-end h-full overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.8, delay: idx * 0.05 }}
                className={`w-full rounded-t-lg ${item.color || 'bg-blue-500'}`}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Donut Chart Component ---
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export const SVGDonutChart: React.FC<DonutChartProps> = ({ data, size = 160 }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  if (total === 0) return null;

  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, idx) => {
            const strokeDasharray = (item.value / total) * circumference;
            const strokeDashoffset = -currentOffset;
            currentOffset += strokeDasharray;

            return (
              <motion.circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                strokeDashoffset={strokeDashoffset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="font-bold text-gray-900 dark:text-white ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Heatmap Component (for Habits) ---
interface HeatmapProps {
  history: Record<string, boolean>; // 'YYYY-MM-DD': boolean
  daysCount?: number;
}

export const HabitHeatmap: React.FC<HeatmapProps> = ({ history, daysCount = 60 }) => {
  const days: { dateStr: string; completed: boolean }[] = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      dateStr,
      completed: !!history[dateStr],
    });
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex flex-wrap gap-1.5 min-w-[300px]">
        {days.map((day, idx) => (
          <div
            key={idx}
            title={`${day.dateStr}: ${day.completed ? 'Completed' : 'Not completed'}`}
            className={`w-3.5 h-3.5 rounded-xs transition-colors ${
              day.completed
                ? 'bg-blue-500 shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
