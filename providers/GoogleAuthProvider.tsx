'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from '../services/google/auth.service';
import { syncService, SyncState } from '../services/google/sync.service';
import { GoogleAccountSession, clearAllUserData } from '../database/dexie';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useCareerStore } from '../store/useCareerStore';
import { useResearchStore } from '../store/useResearchStore';
import { useHabitStore } from '../store/useHabitStore';
import { useGoalStore } from '../store/useGoalStore';
import { useNotesStore } from '../store/useNotesStore';
import { useCalendarStore } from '../store/useCalendarStore';

import { RequestAccessModal } from '../components/modals/RequestAccessModal';
import { SignInEmailModal } from '../components/modals/SignInEmailModal';

interface AuthContextType {
  session: GoogleAccountSession | null;
  syncState: SyncState;
  syncMessage: string;
  accessModalOpen: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  openAccessModal: (email?: string) => void;
  closeAccessModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  syncState: 'idle',
  syncMessage: '',
  accessModalOpen: false,
  signIn: async () => {},
  signOut: async () => {},
  syncNow: async () => {},
  openAccessModal: () => {},
  closeAccessModal: () => {},
});

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GoogleAccountSession | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState('');

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '847306520518-3raubtg9ajcg8ebsjr91mkgjm9j2vqqt.apps.googleusercontent.com';

  useEffect(() => {
    // Restore session on mount & sync user profile to MongoDB
    authService.getSession().then((sess) => {
      if (sess) {
        setSession(sess);
        if (sess.email) {
          const userKey = `orbit_onboarding_${sess.email}_completed`;
          const isLocalOnboarded = typeof window !== 'undefined' && (
            localStorage.getItem(userKey) === 'true' ||
            localStorage.getItem('orbit_onboarding_completed') === 'true'
          );

          fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: sess.email,
              name: sess.name,
              picture: sess.picture,
              ...(isLocalOnboarded && { onboardingCompleted: true }),
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.user?.onboardingCompleted) {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('orbit_onboarding_completed', 'true');
                  localStorage.setItem(`orbit_onboarding_${sess.email}_completed`, 'true');
                }
              }
            })
            .catch((err) => console.warn('Failed to sync user session to MongoDB', err));
        }
        // Trigger full sync with Google Calendar & Google Tasks on initial load
        syncService.syncAll();
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
    // Open email pre-check modal first to avoid unverified Google 403 popups
    setEmailModalOpen(true);
  };

  const directOAuthSignIn = async () => {
    // Detect when user returns to main window after Google OAuth window interaction
    const handleFocus = () => {
      setTimeout(async () => {
        const sess = await authService.getSession();
        if (!sess) {
          // If no session created, Google popup was closed or blocked with 403
          setAccessModalOpen(true);
        }
        window.removeEventListener('focus', handleFocus);
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);

    try {
      const sess = await authService.signIn();
      setSession(sess);
      await syncService.syncAll();
    } catch (err: any) {
      console.error('Google Sign In failed or blocked:', err);
      setAccessModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    await clearAllUserData();
    
    // Reset all Zustand memory states to empty
    useTaskStore.setState({ tasks: [] });
    useProjectStore.setState({ projects: [] });
    useCareerStore.setState({ jobs: [], interviewTopics: [], dsaTopics: [] });
    useResearchStore.setState({ projects: [] });
    useHabitStore.setState({ habits: [] });
    useGoalStore.setState({ goals: [] });
    useNotesStore.setState({ notes: [] });
    useCalendarStore.setState({ events: [] });

    setSession(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleSyncNow = async () => {
    await syncService.syncAll();
  };

  const handleOpenAccessModal = (email?: string) => {
    if (email) setBlockedEmail(email);
    setAccessModalOpen(true);
  };

  const handleCloseAccessModal = () => {
    setAccessModalOpen(false);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider
        value={{
          session,
          syncState,
          syncMessage,
          accessModalOpen,
          signIn: handleSignIn,
          signOut: handleSignOut,
          syncNow: handleSyncNow,
          openAccessModal: handleOpenAccessModal,
          closeAccessModal: handleCloseAccessModal,
        }}
      >
        {children}
        <SignInEmailModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          onProceedToOAuth={directOAuthSignIn}
          onRequestAccess={(email) => handleOpenAccessModal(email)}
        />
        <RequestAccessModal
          isOpen={accessModalOpen}
          onClose={handleCloseAccessModal}
          initialEmail={blockedEmail}
        />
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useGoogleAuth() {
  return useContext(AuthContext);
}
