'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/google/auth.service';
import { syncService, SyncState } from '../services/google/sync.service';
import { GoogleAccountSession } from '../database/dexie';

interface AuthContextType {
  session: GoogleAccountSession | null;
  syncState: SyncState;
  syncMessage: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  syncState: 'idle',
  syncMessage: '',
  signIn: async () => {},
  signOut: async () => {},
  syncNow: async () => {},
});

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GoogleAccountSession | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '847306520518-3raubtg9ajcg8ebsjr91mkgjm9j2vqqt.apps.googleusercontent.com';

  useEffect(() => {
    // Restore session on mount
    authService.getSession().then((sess) => {
      if (sess) {
        setSession(sess);
      }
    });

    // Subscribe to sync state updates
    const unsubscribe = syncService.subscribe((state, msg) => {
      setSyncState(state);
      if (msg) setSyncMessage(msg);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const sess = await authService.signIn();
      setSession(sess);
      await syncService.syncAll();
    } catch (err) {
      console.error('Google Sign In failed', err);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setSession(null);
  };

  const handleSyncNow = async () => {
    await syncService.syncAll();
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider
        value={{
          session,
          syncState,
          syncMessage,
          signIn: handleSignIn,
          signOut: handleSignOut,
          syncNow: handleSyncNow,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useGoogleAuth() {
  return useContext(AuthContext);
}
