import { create } from 'zustand';
import { UserSettings } from '../types';
import { INITIAL_SETTINGS } from './seedData';

interface SettingsState {
  settings: UserSettings;

  loadFromDB: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  toggleSidebar: () => Promise<void>;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  if (typeof window !== 'undefined') {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          set({ settings: data.settings });
        }
      })
      .catch((err) => console.warn('[MongoDB SettingsSync] Offline or API unreachable', err));
  }

  return {
    settings: INITIAL_SETTINGS,

    loadFromDB: async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          set({ settings: data.settings });
        }
      } catch (err) {
        console.warn('Failed to load settings from MongoDB API', err);
      }
    },

    updateSettings: async (updates) => {
      const newSettings = { ...get().settings, ...updates };
      set({ settings: newSettings });

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

      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).catch((err) => console.warn('Failed to save sidebar state to MongoDB API', err));
    },

    resetSettings: () => set({ settings: INITIAL_SETTINGS }),
  };
});
