'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Activity,
  Briefcase,
  FileText,
  BarChart3,
  CalendarDays,
  Target,
  Link2,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  Home,
} from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { SyncStatusBadge } from '../common/SyncStatusBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTour?: () => void;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({
  isOpen,
  onClose,
  onOpenTour,
}) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { session, signIn, signOut } = useGoogleAuth();

  const moduleGrid = [
    { name: 'Home', href: '/', icon: Home, color: 'text-orbit-blue bg-orbit-blue/10 border-orbit-blue/20' },
    { name: 'Career & DSA', href: '/career', icon: GraduationCap, color: 'text-orbit-blue bg-orbit-blue/10 border-orbit-blue/20' },
    { name: 'Research', href: '/research', icon: BookOpen, color: 'text-orbit-orange bg-orbit-orange/10 border-orbit-orange/20' },
    { name: 'Habits', href: '/habits', icon: Activity, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { name: 'Clients', href: '/clients', icon: Briefcase, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { name: 'Notes', href: '/notes', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Weekly Planner', href: '/weekly-planner', icon: CalendarDays, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { name: 'Goals', href: '/goals', icon: Target, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { name: 'Saved Links', href: '/links', icon: Link2, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600 dark:text-gray-300 bg-gray-500/10 border-gray-500/20' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[95vh] overflow-y-auto no-scrollbar space-y-5">
        {/* Top Swipe Handle & Header Bar */}
        <SheetHeader className="flex flex-col items-center gap-3">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700/80" />
          <SheetTitle className="w-full text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white pt-1">
            More Orbit Modules
          </SheetTitle>
        </SheetHeader>

        {/* Touch Module Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {moduleGrid.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${
                  isActive
                    ? 'bg-orbit-blue/10 border-orbit-blue/40 text-orbit-blue font-bold shadow-xs'
                    : 'bg-gray-50/70 dark:bg-gray-900/60 border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold truncate">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User Session & Settings Controls */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
          {/* Sync Status & Theme Row */}
          <div className="flex items-center justify-between">
            <SyncStatusBadge />
            <Button
              size="sm"
              variant="outline"
              onClick={toggleTheme}
              className="gap-2 font-bold cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>

          {/* Account / Auth Actions */}
          {session ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800/60">
              <div className="flex items-center gap-3">
                <img
                  src={session.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={session.name || 'User'}
                  className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                    {session.name || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {session.email}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                signIn();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl text-xs font-bold gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Google</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
