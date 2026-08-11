import { create } from 'zustand';
import { UserSettings, OnboardingProfile } from '../types';
import { INITIAL_SETTINGS } from './seedData';
import { isUserAuthenticated } from '../lib/authCheck';

interface SettingsState {
  settings: UserSettings;
  isLoadingSettings: boolean;
  isGuestMode: boolean;

  loadFromDB: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  toggleSidebar: () => Promise<void>;
  resetSettings: () => void;

  // Onboarding actions
  saveOnboardingProfile: (profile: OnboardingProfile) => Promise<void>;
  completeOnboarding: () => void;

  // Derived helpers
  isOnboarded: () => boolean;
  enabledModules: () => string[];
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const localCompleted = typeof window !== 'undefined' && localStorage.getItem('orbit_onboarding_completed') === 'true';

  const initialSettings: UserSettings = {
    ...INITIAL_SETTINGS,
    onboarding: localCompleted
      ? {
          displayName: 'User',
          role: 'custom',
          enabledModules: [],
          workStartTime: '09:00',
          workEndTime: '18:00',
          primaryGoal: '',
          onboardingCompleted: true,
        }
      : INITIAL_SETTINGS.onboarding,
  };

  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) {
        set({ isGuestMode: true, isLoadingSettings: false });
        return;
      }
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            const isCompletedInDB = !!data.settings.onboarding?.onboardingCompleted;
            if (isCompletedInDB) {
              localStorage.setItem('orbit_onboarding_completed', 'true');
            }
            set((state) => ({
              settings: {
                ...data.settings,
                onboarding: {
                  ...data.settings.onboarding,
                  onboardingCompleted: isCompletedInDB || localCompleted,
                },
              },
              isLoadingSettings: false,
              isGuestMode: false,
            }));
          } else {
            set({ isLoadingSettings: false, isGuestMode: false });
          }
        })
        .catch(() => {
          set({ isLoadingSettings: false });
        });
    });
  }

  return {
    settings: initialSettings,
    isLoadingSettings: false,
    isGuestMode: false,

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) {
        set({ isGuestMode: true, isLoadingSettings: false });
        return;
      }
      set({ isLoadingSettings: true });
      try {
        const isLocalDone = typeof window !== 'undefined' && localStorage.getItem('orbit_onboarding_completed') === 'true';
        const res = await fetch('/api/settings');
        if (!res.ok) {
          set({ isLoadingSettings: false, isGuestMode: false });
          return;
        }
        const data = await res.json();
        if (data.settings) {
          const isCompletedInDB = !!data.settings.onboarding?.onboardingCompleted;
          if (isCompletedInDB && typeof window !== 'undefined') {
            localStorage.setItem('orbit_onboarding_completed', 'true');
          }
          set((state) => ({
            settings: {
              ...data.settings,
              onboarding: {
                ...data.settings.onboarding,
                onboardingCompleted: isCompletedInDB || isLocalDone,
              },
            },
            isLoadingSettings: false,
            isGuestMode: false,
          }));
        } else {
          set({ isLoadingSettings: false, isGuestMode: false });
        }
      } catch (err) {
        console.warn('Failed to load settings from MongoDB API', err);
        set({ isLoadingSettings: false });
      }
    },

    updateSettings: async (updates) => {
      const current = get()?.settings || initialSettings;
      const newSettings = { ...current, ...updates };
      set({ settings: newSettings });
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch((err) => console.warn('Failed to save settings to MongoDB API', err));
    },

    toggleSidebar: async () => {
      const current = get()?.settings || initialSettings;
      const newSettings = {
        ...current,
        sidebarCollapsed: !current.sidebarCollapsed,
      };
      set({ settings: newSettings });
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch((err) => console.warn('Failed to save sidebar state to MongoDB API', err));
    },

    resetSettings: () => set({ settings: INITIAL_SETTINGS }),

    saveOnboardingProfile: async (profile) => {
      const completed: OnboardingProfile = {
        ...profile,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbit_onboarding_completed', 'true');
      }
      const current = get()?.settings || initialSettings;
      const newSettings = { ...current, onboarding: completed };
      set({ settings: newSettings });
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });
      } catch (err) {
        console.warn('Failed to save onboarding profile to MongoDB API', err);
      }
    },

    completeOnboarding: async () => {
      const current = get()?.settings || initialSettings;
      const existing = current.onboarding;
      const updatedSettings: UserSettings = {
        ...current,
        onboarding: {
          displayName: existing?.displayName || 'User',
          role: existing?.role || 'custom',
          enabledModules: existing?.enabledModules || [],
          workStartTime: existing?.workStartTime || '09:00',
          workEndTime: existing?.workEndTime || '18:00',
          primaryGoal: existing?.primaryGoal || '',
          ...existing,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      };

      set({ settings: updatedSettings });

      if (typeof window !== 'undefined') {
        localStorage.setItem('orbit_onboarding_completed', 'true');
      }

      const authenticated = await isUserAuthenticated();
      if (authenticated) {
        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings),
          });
        } catch (err) {
          console.warn('Failed to save completed onboarding to MongoDB API', err);
        }
      }
    },

    isOnboarded: () => {
      if (typeof window !== 'undefined' && localStorage.getItem('orbit_onboarding_completed') === 'true') {
        return true;
      }
      return !!get()?.settings?.onboarding?.onboardingCompleted;
    },

    enabledModules: () => {
      return get()?.settings?.onboarding?.enabledModules ?? [];
    },
  };
});

