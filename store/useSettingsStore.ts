import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserSettings } from '../types';
import { INITIAL_SETTINGS } from './seedData';

interface SettingsState {
  settings: UserSettings;

  updateSettings: (updates: Partial<UserSettings>) => void;
  toggleSidebar: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: INITIAL_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
      },

      toggleSidebar: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            sidebarCollapsed: !state.settings.sidebarCollapsed,
          },
        }));
      },

      resetSettings: () => set({ settings: INITIAL_SETTINGS }),
    }),
    {
      name: 'meraj_os_settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
