'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base shimmer Primitive
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`}
    />
  );
};

/**
 * Dashboard Page Skeleton
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-1 animate-in fade-in duration-300">
      {/* Hero Welcome Banner Skeleton */}
      <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top 3 MITs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Habits & Goals Quick Preview */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 space-y-4">
            <Skeleton className="h-5 w-36" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Task List Skeleton
 */
export const TaskSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-1">
      {/* Search & Filter Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
        <Skeleton className="h-10 w-full md:w-80 rounded-xl" />
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Task Item Cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1">
              <Skeleton className="h-5 w-5 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Calendar Grid Skeleton
 */
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-1">
      {/* Calendar Header Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
        <Skeleton className="h-8 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Grid Header (Days of week) */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-6 w-full rounded-lg" />
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-2 space-y-2">
            <Skeleton className="h-4 w-6 rounded-md" />
            {i % 3 === 0 && <Skeleton className="h-4 w-full rounded-md" />}
            {i % 5 === 0 && <Skeleton className="h-4 w-3/4 rounded-md" />}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Notes Grid Skeleton
 */
export const NotesSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Habits Tracker Skeleton
 */
export const HabitsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Skeleton key={day} className="h-9 w-9 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Career / Research / Generic Card Grid Skeleton
 */
export const GridCardsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200/70 dark:border-slate-800/70 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Generic Table Skeleton Loader
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
};
