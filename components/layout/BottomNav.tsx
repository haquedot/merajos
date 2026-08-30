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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors">
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
                className={`relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-transform duration-150 active:scale-90 ${
                  isActive
                    ? 'text-orbit-blue font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavTab"
                    className="absolute inset-0 bg-orbit-blue/10 dark:bg-orbit-blue/20 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4.5 h-4.5 z-10 ${isActive ? 'scale-110' : ''}`} />
              </Link>
            );
          })}
        </div>

        {/* Center Floating Action Button (FAB Quick Add with Moving Border Animation) */}
        <div className="relative flex items-center justify-center w-24 shrink-0">
          <div className="relative rounded-full p-[2.5px] overflow-hidden group shadow-xl shadow-orbit-blue/30">
            {/* Continuous Rotating Conic Gradient Beam */}
            {/* <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-[250%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-100 pointer-events-none"
            /> */}

            {/* Inner Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-orbit-blue text-white shadow-md active:scale-90 transition-transform duration-150 cursor-pointer"
              aria-label="Quick Add Task"
              title="Quick Add Task"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
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
                className={`relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-transform duration-150 active:scale-90 ${
                  isActive
                    ? 'text-orbit-blue font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNavTab"
                    className="absolute inset-0 bg-orbit-blue/10 dark:bg-orbit-blue/20 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4.5 h-4.5 z-10 ${isActive ? 'scale-110' : ''}`} />
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            onClick={onOpenMoreSheet}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-transform duration-150 active:scale-90 cursor-pointer"
            aria-label="More Navigation Modules"
            title="More Modules"
          >
            <Grid className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
