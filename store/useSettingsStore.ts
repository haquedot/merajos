import { create } from 'zustand';
import { UserSettings, OnboardingProfile } from '../types';
import { INITIAL_SETTINGS } from './seedData';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';
import { authService } from '../services/google/auth.service';

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

const DEFAULT_ONBOARDING: OnboardingProfile = {
  displayName: 'User',
  role: 'custom',
  enabledModules: [
    'tasks',
    'calendar',
    'habits',
    'research',
    'goals',
    'notes',
    'weekly_planner',
    'analytics',
    'clients',
    'career',
  ],
  workStartTime: '09:00',
  workEndTime: '18:00',
  primaryGoal: '',
  onboardingCompleted: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  const localCompleted = typeof window !== 'undefined' && localStorage.getItem('orbit_onboarding_completed') === 'true';

  const defaultOnboarding = INITIAL_SETTINGS.onboarding || DEFAULT_ONBOARDING;

  const initialSettings: UserSettings = {
    ...INITIAL_SETTINGS,
    onboarding: localCompleted
      ? {
          ...defaultOnboarding,
          onboardingCompleted: true,
        }
      : defaultOnboarding,
  };

  if (typeof window !== 'undefined') {
    setTimeout(() => {
      get().loadFromDB();
    }, 0);
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
        const headers = await getAuthHeaders();
        const res = await fetch('/api/settings', { headers });
        
        let fetchedSettings: UserSettings | null = null;
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            fetchedSettings = data.settings;
          }
        }

        // Fetch User profile to ensure enabledModules and user details are synced
        const userRes = await fetch('/api/user', { headers });
        let dbUserModules: any[] | null = null;
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData?.user?.enabledModules && Array.isArray(userData.user.enabledModules) && userData.user.enabledModules.length > 0) {
            dbUserModules = userData.user.enabledModules;
          }
        }

        const baseOnboarding = fetchedSettings?.onboarding || initialSettings.onboarding || defaultOnboarding;
        const isCompletedInDB = !!baseOnboarding?.onboardingCompleted;

        if (isCompletedInDB && typeof window !== 'undefined') {
          localStorage.setItem('orbit_onboarding_completed', 'true');
        }

        const finalModules = (baseOnboarding.enabledModules && baseOnboarding.enabledModules.length > 0)
          ? baseOnboarding.enabledModules
          : (dbUserModules || defaultOnboarding.enabledModules);

        const mergedSettings: UserSettings = fetchedSettings ? {
          ...fetchedSettings,
          onboarding: {
            ...defaultOnboarding,
            ...fetchedSettings.onboarding,
            enabledModules: finalModules,
            onboardingCompleted: isCompletedInDB || isLocalDone,
          },
        } : {
          ...initialSettings,
          onboarding: {
            ...defaultOnboarding,
            enabledModules: finalModules,
            onboardingCompleted: isLocalDone,
          },
        };

        set({
          settings: mergedSettings,
          isLoadingSettings: false,
          isGuestMode: false,
        });
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
      try {
        const headers = await getAuthHeaders();
        await fetch('/api/settings', {
          method: 'POST',
          headers,
          body: JSON.stringify(newSettings),
        });

        if (newSettings.onboarding?.enabledModules) {
          await fetch('/api/user', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              enabledModules: newSettings.onboarding.enabledModules,
            }),
          });
        }
      } catch (err) {
        console.warn('Failed to save settings to MongoDB API', err);
      }
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
      try {
        const headers = await getAuthHeaders();
        await fetch('/api/settings', {
          method: 'POST',
          headers,
          body: JSON.stringify(newSettings),
        });
      } catch (err) {
        console.warn('Failed to save sidebar state to MongoDB API', err);
      }
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
        const headers = await getAuthHeaders();
        await fetch('/api/settings', {
          method: 'POST',
          headers,
          body: JSON.stringify(newSettings),
        });
        const sess = await authService.getSession();
        if (sess?.email) {
          localStorage.setItem(`orbit_onboarding_${sess.email}_completed`, 'true');
          await fetch('/api/user', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: sess.email,
              onboardingCompleted: true,
              role: profile.role,
              enabledModules: profile.enabledModules,
              workStartTime: profile.workStartTime,
              workEndTime: profile.workEndTime,
            }),
          });
        }
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
          enabledModules: existing?.enabledModules || defaultOnboarding.enabledModules,
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
          const headers = await getAuthHeaders();
          await fetch('/api/settings', {
            method: 'POST',
            headers,
            body: JSON.stringify(updatedSettings),
          });
          const sess = await authService.getSession();
          if (sess?.email) {
            localStorage.setItem(`orbit_onboarding_${sess.email}_completed`, 'true');
            await fetch('/api/user', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                email: sess.email,
                onboardingCompleted: true,
                role: existing?.role || 'custom',
                enabledModules: existing?.enabledModules || defaultOnboarding.enabledModules,
                workStartTime: existing?.workStartTime || '09:00',
                workEndTime: existing?.workEndTime || '18:00',
              }),
            });
          }
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
      return get()?.settings?.onboarding?.enabledModules ?? defaultOnboarding.enabledModules;
    },
  };
});



