'use client';

import React from 'react';
import Link from 'next/link';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ModuleKey } from '../../types';
import { Lock, Settings, LogIn } from 'lucide-react';
import { Button } from '../ui/button';

interface ModuleGuardProps {
  moduleKey: ModuleKey;
  moduleName: string;
  moduleDescription?: string;
  children: React.ReactNode;
}

export function ModuleGuard({
  moduleKey,
  moduleName,
  moduleDescription,
  children,
}: ModuleGuardProps) {
  const { session, signIn } = useGoogleAuth();
  const { settings, isLoadingSettings } = useSettingsStore();

  const ALWAYS_ON: ModuleKey[] = ['tasks', 'calendar'];
  if (ALWAYS_ON.includes(moduleKey)) {
    return <>{children}</>;
  }

  // 1. Unauthenticated Guest Access Gate
  if (!session) {
    return (
      <div className="p-8 sm:p-12 max-w-lg mx-auto text-center space-y-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl my-12">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-orbit-blue flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {moduleName} Requires Authentication
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {moduleDescription ||
              `Sign in with your Google account to unlock, customize, and sync ${moduleName} data across all your devices.`}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Button
            onClick={signIn}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-orbit-blue hover:bg-orbit-blue-hover text-white shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access {moduleName}</span>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Module Disabled in Settings
  const enabledModules = settings.onboarding?.enabledModules ?? [];
  const isEnabled = enabledModules.includes(moduleKey);

  if (!isLoadingSettings && !isEnabled) {
    return (
      <div className="p-8 sm:p-12 max-w-lg mx-auto text-center space-y-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl my-12">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Settings className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {moduleName} Module Disabled
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            You have disabled the {moduleName} module in your Orbit settings. Re-enable it in Settings to access your data.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/settings"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-orbit-blue hover:bg-orbit-blue-hover text-white shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>Enable in Settings</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authenticated & Module Enabled
  return <>{children}</>;
}
