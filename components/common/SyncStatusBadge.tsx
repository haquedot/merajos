'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';

export const SyncStatusBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const { syncState, syncNow, session } = useGoogleAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setLastSyncTime('Just now');
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update relative sync time periodically
    const interval = setInterval(() => {
      setLastSyncTime('Just now');
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const isSyncing = syncState === 'syncing';

  return (
    <button
      type="button"
      onClick={syncNow}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
        !isOnline
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
          : isSyncing
          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
      }`}
      title={
        !isOnline
          ? 'Working offline. Changes are saved locally to Dexie DB and will sync when reconnected.'
          : session
          ? `Google & Dexie DB Synced (${lastSyncTime}). Click to sync now.`
          : `Local Dexie DB Active (${lastSyncTime}). Sign in to sync with Google.`
      }
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Offline</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{session ? 'Synced' : 'Local Synced'}</span>
        </>
      )}
    </button>
  );
};
