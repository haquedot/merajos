'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sun,
  Calendar as CalendarIcon,
  CheckSquare,
  Briefcase,
  BookOpen,
  GraduationCap,
  Activity,
  CalendarDays,
  Target,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Logo } from '../common/Logo';
import { BRAND } from '../../lib/branding';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { Tooltip } from '../ui/tooltip';

export const sidebarItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, moduleKey: null, alwaysShow: true },
  { name: 'Today', href: '/today', icon: Sun, moduleKey: null, alwaysShow: true },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon, moduleKey: 'calendar', alwaysShow: true },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, moduleKey: 'tasks', alwaysShow: true },
  { name: 'Clients', href: '/clients', icon: Briefcase, moduleKey: 'clients', alwaysShow: false },
  { name: 'Research', href: '/research', icon: BookOpen, moduleKey: 'research', alwaysShow: false },
  { name: 'Career & DSA', href: '/career', icon: GraduationCap, moduleKey: 'career', alwaysShow: false },
  { name: 'Habits', href: '/habits', icon: Activity, moduleKey: 'habits', alwaysShow: false },
  { name: 'Weekly Planner', href: '/weekly-planner', icon: CalendarDays, moduleKey: 'weekly_planner', alwaysShow: false },
  { name: 'Goals', href: '/goals', icon: Target, moduleKey: 'goals', alwaysShow: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, moduleKey: 'analytics', alwaysShow: false },
  { name: 'Notes & Brain Dump', href: '/notes', icon: FileText, moduleKey: 'notes', alwaysShow: false },
  { name: 'Settings', href: '/settings', icon: Settings, moduleKey: null, alwaysShow: true },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { settings, toggleSidebar } = useSettingsStore();
  const { session } = useGoogleAuth();
  const collapsed = settings.sidebarCollapsed;

  // Modules shown to unauthenticated (guest) users
  const GUEST_MODULES = ['tasks', 'calendar', 'notes'];

  // Determine which modules to show:
  // - Guest (no session): only GUEST_MODULES
  // - Signed-in, onboarding complete: user's chosen enabledModules
  // - Signed-in, onboarding not done yet: show all (will be gated by onboarding modal)
  const enabledModules = settings.onboarding?.enabledModules ?? null;

  const visibleItems = sidebarItems.filter((item) => {
    // Dashboard, Today, Settings always visible
    if (item.alwaysShow && !item.moduleKey) return true;

    if (!session) {
      // Guest mode: only allow Tasks, Calendar, Notes (and always-on items)
      return !item.moduleKey || GUEST_MODULES.includes(item.moduleKey);
    }

    // Signed-in: filter by onboarding module selection
    if (item.alwaysShow) return true;
    if (!enabledModules) return true; // onboarding not done yet — show all
    return enabledModules.includes(item.moduleKey as any);
  });

  const sidebarContent = (
    <div className="relative flex flex-col h-full bg-white dark:bg-[#101827] border-r border-[#E2E8F0] dark:border-[#243244] transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0] dark:border-[#243244]">
        {collapsed ? (
          <button
            onClick={toggleSidebar}
            id="tour-sidebar-logo"
            className="group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200/60 dark:hover:border-blue-800/60 transition-all duration-300 ease-out active:scale-95 cursor-pointer"
            title="Expand sidebar"
          >
            {/* Logo shown by default (fades out & shrinks on hover) */}
            <span className="absolute flex items-center justify-center transition-all duration-250 ease-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75 pointer-events-none">
              <Logo variant="icon" size={28} />
            </span>
            {/* Expand toggle icon (fades in & scales up on hover with subtle shift right) */}
            <span className="absolute flex items-center justify-center transition-all duration-250 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 text-blue-600 dark:text-blue-400">
              <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </button>
        ) : (
          <>
            <Link id="tour-sidebar-logo" href="/" className="flex items-center gap-3 overflow-hidden transition-transform duration-200 active:scale-98">
              <Logo variant="horizontal" size={32} showTagline={true} />
            </Link>

            {/* Desktop Collapse button */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 active:scale-90"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation List */}
      <div id="tour-sidebar-navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 ease-out relative group active:scale-[0.98] ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#1E293B] hover:text-gray-900 dark:hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              {/* Sliding Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarPill"
                  className="absolute inset-0 bg-[#1F3B99] rounded-xl shadow-xs shadow-indigo-900/20 z-0"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                  }}
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 z-10 transition-transform duration-200 ease-out group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                }`}
              />
              {!collapsed && <span className="truncate z-10 transition-colors duration-200">{item.name}</span>}
              {collapsed && (
                <span className="sr-only">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Action Controls in Sidebar (Mobile & Desktop) */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#243244] space-y-1.5 bg-gray-50/50 dark:bg-gray-900/40">
        {/* Modern Theme Switch Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/80 flex items-center justify-between transition-all duration-200 ease-out group cursor-pointer active:scale-98"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-200 group-hover:rotate-45" />
            )}
            {!collapsed && (
              <span className="truncate">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            )}
          </div>

          {!collapsed ? (
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 relative flex items-center ${theme === 'dark'
                  ? 'bg-indigo-600 dark:bg-indigo-600'
                  : 'bg-gray-300 dark:bg-gray-700'
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out flex items-center justify-center ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                  }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-2.5 h-2.5 text-indigo-600" />
                ) : (
                  <Sun className="w-2.5 h-2.5 text-amber-500" />
                )}
              </div>
            </div>
          ) : (
            <div
              className={`w-2 h-2 rounded-full transition-all shrink-0 ${theme === 'dark' ? 'bg-indigo-400' : 'bg-amber-400'
                }`}
            />
          )}
        </button>

        {/* Platform Tour */}
        <button
          onClick={() => {
            onMobileClose();
            const tourBtn = document.getElementById('tour-help-icon');
            if (tourBtn) tourBtn.click();
          }}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-blue-500" />
          {!collapsed && <span className="truncate">Platform Tour</span>}
        </button>
      </div>

      {/* Footer Branding Info */}
      {!collapsed && (
        <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{BRAND.name} v{BRAND.version}</p>
            <p className="truncate">{BRAND.tagline}</p>
          </div>
          <SyncStatusBadge />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-30 transition-all duration-300 ${collapsed ? 'w-18' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
