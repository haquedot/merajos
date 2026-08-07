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
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { Logo } from '../common/Logo';
import { BRAND } from '../../lib/branding';

export const sidebarItems = [
  { name: 'Dashboard',        href: '/',               icon: LayoutDashboard, moduleKey: null,            alwaysShow: true },
  { name: 'Today',            href: '/today',          icon: Sun,             moduleKey: null,            alwaysShow: true },
  { name: 'Calendar',        href: '/calendar',       icon: CalendarIcon,    moduleKey: 'calendar',      alwaysShow: true },
  { name: 'Tasks',            href: '/tasks',          icon: CheckSquare,     moduleKey: 'tasks',         alwaysShow: true },
  { name: 'Clients',          href: '/clients',        icon: Briefcase,       moduleKey: 'clients',       alwaysShow: false },
  { name: 'Research',         href: '/research',       icon: BookOpen,        moduleKey: 'research',      alwaysShow: false },
  { name: 'Career & DSA',     href: '/career',         icon: GraduationCap,   moduleKey: 'career',        alwaysShow: false },
  { name: 'Habits',           href: '/habits',         icon: Activity,        moduleKey: 'habits',        alwaysShow: false },
  { name: 'Weekly Planner',   href: '/weekly-planner', icon: CalendarDays,    moduleKey: 'weekly_planner',alwaysShow: false },
  { name: 'Goals',            href: '/goals',          icon: Target,          moduleKey: 'goals',         alwaysShow: false },
  { name: 'Analytics',        href: '/analytics',      icon: BarChart3,       moduleKey: 'analytics',     alwaysShow: false },
  { name: 'Notes & Brain Dump', href: '/notes',        icon: FileText,        moduleKey: 'notes',         alwaysShow: false },
  { name: 'Settings',         href: '/settings',       icon: Settings,        moduleKey: null,            alwaysShow: true },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
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
    <div className="flex flex-col h-full bg-white dark:bg-[#101827] border-r border-[#E2E8F0] dark:border-[#243244] transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2E8F0] dark:border-[#243244]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          {collapsed ? (
            <Logo variant="icon" size={28} />
          ) : (
            <Logo variant="horizontal" size={28} showTagline={false} />
          )}
        </Link>

        {/* Desktop Collapse button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group ${
                isActive
                  ? 'bg-[#1F3B99] text-white font-semibold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#1E293B] hover:text-gray-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                }`}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute right-0 top-2 bottom-2 w-1 bg-[#6D5BFF] rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Branding Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500">
          <p className="font-semibold text-gray-700 dark:text-gray-300">{BRAND.name} v{BRAND.version}</p>
          <p className="truncate">{BRAND.tagline}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
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
