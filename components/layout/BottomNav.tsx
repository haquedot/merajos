'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sun,
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  Grid,
} from 'lucide-react';

interface BottomNavProps {
  onOpenQuickAdd: () => void;
  onOpenMoreSheet: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenQuickAdd,
  onOpenMoreSheet,
}) => {
  const pathname = usePathname();

  const mainTabs = [
    { name: 'Today', href: '/today', icon: Sun },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  const rightTabs = [
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* Left Tabs (Today, Tasks) */}
        <div className="flex items-center justify-around flex-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-transform duration-150 active:scale-90 ${
                  isActive
                    ? 'text-orbit-blue font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavTab"
                    className="absolute inset-0 bg-orbit-blue/10 dark:bg-orbit-blue/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 z-10 ${isActive ? 'scale-110' : ''}`} />
                {/* <span className="text-[10px] font-semibold mt-0.5 z-10">
                  {tab.name}
                </span> */}
              </Link>
            );
          })}
        </div>

        {/* Center Floating Action Button (FAB Quick Add) */}
        <div className="relative flex items-center justify-center w-14 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="absolute flex items-center justify-center w-13 h-13 rounded-full bg-orbit-blue text-white shadow-lg shadow-orbit-blue/40 border-4 border-white dark:border-[#0A0F1D] active:scale-90 transition-all duration-200 cursor-pointer"
            aria-label="Quick Add Task"
            title="Quick Add Task"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Tabs (Calendar, More) */}
        <div className="flex items-center justify-around flex-1">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-transform duration-150 active:scale-90 ${
                  isActive
                    ? 'text-orbit-blue font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavTab"
                    className="absolute inset-0 bg-orbit-blue/10 dark:bg-orbit-blue/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 z-10 ${isActive ? 'scale-110' : ''}`} />
                {/* <span className="text-[10px] font-semibold mt-0.5 z-10">
                  {tab.name}
                </span> */}
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            onClick={onOpenMoreSheet}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-transform duration-150 active:scale-90 cursor-pointer"
            aria-label="More Navigation Modules"
            title="More Modules"
          >
            <Grid className="w-5 h-5" />
            {/* <span className="text-[10px] font-semibold mt-0.5">More</span> */}
          </button>
        </div>
      </div>
    </nav>
  );
};
