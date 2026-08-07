'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  PanelRight,
  Menu,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  User,
  Zap,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Tagline } from '../common/Tagline';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { useTheme } from '../../providers/ThemeProvider';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onToggleRightPanel: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileSidebar,
  onToggleRightPanel,
  onOpenQuickAdd,
  onOpenSearch,
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
      alert(`✅ Cron Job Executed Successfully!\n\nAll ${currentTasks.length} tasks persisted into MongoDB!\n\n${data.message}`);
    } catch (err: any) {
      alert(`❌ Cron execution error: ${err.message}`);
    } finally {
      setIsCronRunning(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const completionRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#101827] border-b border-[#E2E8F0] dark:border-[#243244] px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Mobile menu & Quick search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open Mobile Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border border-[#E2E8F0] dark:border-[#243244] transition-all w-10 sm:w-44 md:w-56"
        >
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="flex-1 text-left truncate">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded border border-[#E2E8F0] dark:border-[#243244]">
            ⌘K
          </kbd>
        </button>

        {/* Orbit Brand Header & Tagline (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 ml-2 border-l border-[#E2E8F0] dark:border-[#243244] pl-4">
          <Tagline size="xs" />
        </div>
      </div>

      {/* Right section: Sync Status, Run Cron, Theme Toggle, Profile Menu */}
      <div className="flex items-center gap-1 sm:gap-2.5">
        {/* Run Daily Summary Button (Shown when RUN_CRON_JOB is true) */}
        {process.env.NEXT_PUBLIC_RUN_CRON_JOB === 'true' && (
          <button
            onClick={handleRunCronJob}
            disabled={isCronRunning}
            className="btn-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
            title="Calculate and log daily task performance summary"
          >
            <Zap className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isCronRunning ? 'Calculating...' : 'Run Daily Summary'}</span>
          </button>
        )}

        {/* Google Sync Status Pill */}
        <button
          onClick={syncNow}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-[#E2E8F0] dark:border-[#243244] transition-all"
          title={syncMessage || 'Click to synchronize with Google'}
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
          ) : syncState === 'offline' ? (
            <CloudOff className="w-3.5 h-3.5 text-[#F59E0B]" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-[#22C55E]" />
          )}
          <span className="hidden md:inline">
            {syncState === 'syncing'
              ? 'Syncing...'
              : syncState === 'offline'
              ? 'Offline'
              : session
              ? 'Google Synced'
              : 'Local Mode'}
          </span>
        </button>

        {/* Quick Add Button (Primary Orbit Blue) */}
        <button
          onClick={onOpenQuickAdd}
          className="btn-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Right Panel Toggle */}
        <button
          onClick={onToggleRightPanel}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
          aria-label="Toggle Focus Panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Google User Profile Menu */}
        <div className="relative">
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

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
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
