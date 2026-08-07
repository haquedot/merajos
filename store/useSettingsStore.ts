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
  if (typeof window !== 'undefined') {
    set({ isLoadingSettings: true });
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) {
        set({ isGuestMode: true, isLoadingSettings: false });
        return;
      }
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            set({ settings: data.settings, isLoadingSettings: false, isGuestMode: false });
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
    settings: INITIAL_SETTINGS,
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
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          set({ settings: data.settings, isLoadingSettings: false, isGuestMode: false });
        } else {
          set({ isLoadingSettings: false, isGuestMode: false });
        }
      } catch (err) {
        console.warn('Failed to load settings from MongoDB API', err);
        set({ isLoadingSettings: false });
      }
    },

    updateSettings: async (updates) => {
      const newSettings = { ...get().settings, ...updates };
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
      const newSettings = {
        ...get().settings,
        sidebarCollapsed: !get().settings.sidebarCollapsed,
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
      const newSettings = { ...get().settings, onboarding: completed };
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

    completeOnboarding: () => {
      const existing = get().settings.onboarding;
      if (existing) {
        const updated = { ...existing, onboardingCompleted: true, onboardingCompletedAt: new Date().toISOString() };
        set((state) => ({ settings: { ...state.settings, onboarding: updated } }));
      }
    },

    isOnboarded: () => {
      return !!get().settings.onboarding?.onboardingCompleted;
    },

    enabledModules: () => {
      return get().settings.onboarding?.enabledModules ?? [];
    },
  };
});

