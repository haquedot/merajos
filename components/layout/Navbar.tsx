'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  PanelRight,
  Menu,
  Sparkles,
  Flame,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  User,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

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
  const { settings, updateSettings } = useSettingsStore();
  const { tasks } = useTaskStore();
  const { session, syncState, syncMessage, signIn, signOut, syncNow } = useGoogleAuth();

  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const completionRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Mobile menu & Quick search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open Mobile Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-100/70 dark:bg-gray-800/50 hover:bg-gray-200/70 dark:hover:bg-gray-800 text-xs text-gray-400 dark:text-gray-400 border border-transparent dark:border-gray-700/50 transition-all w-48 md:w-64"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="flex-1 text-left truncate">Search tasks, research, projects...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Sync Status, Theme Toggle, Profile Menu */}
      <div className="flex items-center gap-2.5">
        {/* Google Sync Status Pill */}
        <button
          onClick={syncNow}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title={syncMessage || 'Click to synchronize with Google'}
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : syncState === 'offline' ? (
            <CloudOff className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span className="hidden sm:inline">
            {syncState === 'syncing'
              ? 'Syncing...'
              : syncState === 'offline'
              ? 'Offline'
              : session
              ? 'Google Synced'
              : 'Local Mode'}
          </span>
        </button>

        {/* Today completion pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900/50">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{completionRate}% Today</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {mounted && settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Right Panel Toggle */}
        <button
          onClick={onToggleRightPanel}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Sign in</span>
            </button>
          )}

          {/* Profile Dropdown */}
          {profileMenuOpen && session && (
            <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl space-y-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <img
                  src={session.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    {session.name || 'Merajul Haque'}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">
                    {session.email || 'meraj@gmail.com'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <div className="px-2 py-1 text-[10px] uppercase text-gray-400 font-extrabold">
                  Connected Google Services
                </div>
                <div className="px-2 py-1 flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Google Calendar</span>
                  <span className="text-emerald-500 font-bold">● Active</span>
                </div>
                <div className="px-2 py-1 flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Google Tasks</span>
                  <span className="text-emerald-500 font-bold">● Active</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    signOut();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
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
