'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  User,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Tagline } from '../common/Tagline';
import { Logo } from '../common/Logo';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import Link from 'next/link';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onToggleRightPanel: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onOpenTour?: () => void;
  onOpenCoPilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onToggleRightPanel,
  onOpenQuickAdd,
  onOpenSearch,
  onOpenTour,
  onOpenCoPilot,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { tasks } = useTaskStore();
  const { session, syncState, syncMessage, signIn, signOut, syncNow } = useGoogleAuth();

  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRunCronJob = async () => {
    setIsCronRunning(true);
    try {
      const currentTasks = useTaskStore.getState().tasks;
      const settings = useSettingsStore.getState().settings;
      const res = await fetch('/api/cron/calculate-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentTasks,
          emailOptions: {
            enabled: settings.emailNotificationsEnabled ?? true,
            recipientEmail: session?.email || settings.notificationEmail,
          },
        }),
      });
      const data = await res.json();
      console.log('Cron execution result:', data);
    } catch (err: any) {
      console.error('Cron execution error:', err);
    } finally {
      setIsCronRunning(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const completionRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  return (
    <header className="h-16 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Orbit Brand identity */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={28} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Orbit OS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#1F3B99]/10 text-[#1F3B99] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]">
                V2
              </span>
            </div>
            <Tagline className="text-[10px]" />
          </div>
        </Link>

        {/* Global Task Completion Status Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Today: <strong className="text-gray-900 dark:text-white font-bold">{completedToday}/{todayTasks.length}</strong> tasks
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Bar Command Trigger */}
        <button
          id="tour-search-trigger"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1E293B] hover:bg-gray-200 dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span>Search workspace...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#0F172A] rounded border border-gray-200 dark:border-gray-700 shadow-xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-400 shrink-0" />
        </button>

        {/* Single Unified Google & Local Sync Status Pill */}
        <button
          id="tour-google-sync"
          onClick={syncNow}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            syncState === 'offline'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : syncState === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : syncState === 'syncing'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-[#E2E8F0] dark:border-[#243244]'
          }`}
          title={syncMessage || 'Click to synchronize with Google'}
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          ) : syncState === 'offline' ? (
            <CloudOff className="w-3.5 h-3.5 text-amber-500" />
          ) : syncState === 'error' ? (
            <CloudOff className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
          )}

          <span className="hidden md:inline">
            {syncState === 'syncing'
              ? 'Syncing...'
              : syncState === 'offline'
              ? 'Offline'
              : syncState === 'error'
              ? 'Re-connect Google'
              : session
              ? 'Google Synced'
              : 'Local Mode'}
          </span>
        </button>

        {/* Quick Add Button (Primary Orbit Blue) */}
        <button
          id="tour-quick-add"
          onClick={onOpenQuickAdd}
          className="hidden sm:flex items-center btn-primary px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Modern Theme Switch Toggle (Desktop navbar) */}
        <button
          onClick={toggleTheme}
          className="hidden sm:flex items-center relative w-12 h-6.5 rounded-full p-0.5 bg-gray-200 dark:bg-gray-800 border border-gray-300/80 dark:border-gray-700 transition-colors focus:outline-hidden cursor-pointer shrink-0"
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
            <Sun className="w-3.5 h-3.5 text-amber-500/70" />
            <Moon className="w-3.5 h-3.5 text-indigo-400/70" />
          </div>

          <div
            className={`w-5 h-5 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-transform duration-200 ease-in-out z-10 ${
              mounted && theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          >
            {mounted && theme === 'dark' ? (
              <Moon className="w-3 h-3 text-indigo-400" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </button>

        {/* Platform Tour Button */}
        {onOpenTour && (
          <button
            id="tour-help-icon"
            onClick={onOpenTour}
            className="hidden sm:flex p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
            aria-label="Platform Tour"
            title="Take Platform Tour"
          >
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </button>
        )}

        {/* Google User Profile Menu */}
        <div id="tour-user-profile" className="hidden sm:flex relative">
          {session ? (
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <img
                src={session.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={session.name || 'User'}
                className="w-7 h-7 rounded-full border border-emerald-500 object-cover"
              />
            </button>
          ) : (
            <button
              onClick={signIn}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Sign in</span>
            </button>
          )}

          {/* Profile Dropdown */}
          {profileMenuOpen && session && (
            <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 space-y-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                <img
                  src={session.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    {session.name || 'Merajul Haque'}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {session.email || 'meraj@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <div className="px-2 py-1 text-[10px] uppercase text-gray-400 font-extrabold">
                  Connected Google Services
                </div>
                <div className="px-2 py-1 flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span>Google Calendar</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                </div>
                <div className="px-2 py-1 flex items-center justify-between text-gray-700 dark:text-gray-300">
                  <span>Google Tasks</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                {onOpenTour && (
                  <button
                    onClick={() => {
                      onOpenTour();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Take Platform Tour
                  </button>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Google Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
