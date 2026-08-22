import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserPreferences,
  CurrentContext,
  Recommendation,
  DerivedSignal,
  UpdateUserPreferencesDTO,
} from '../lib/personalization/types';
import { db } from '../database/dexie';

interface PersonalizationState {
  preferences: UserPreferences | null;
  currentContext: CurrentContext | null;
  recommendations: Recommendation[];
  derivedSignals: DerivedSignal[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: UpdateUserPreferencesDTO) => Promise<void>;
  setCurrentContext: (context: CurrentContext) => void;
  setRecommendations: (recs: Recommendation[]) => void;
  acceptRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  resetAllBehavioralData: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  userId: 'local-user',
  userEmail: 'user@local.com',
  targetRole: 'Software Engineer',
  preferredFocusDurationMinutes: 45,
  maxDailyMITs: 3,
  dailyCapacityHours: 7.0,
  personalizationEnabled: true,
  learnFromTaskBehavior: true,
  learnFromFocusSessions: true,
  learnFromHabits: true,
  categorySlotAffinity: {
    Career: 'morning',
    Research: 'afternoon',
    Client: 'morning',
    Personal: 'evening',
    College: 'morning',
  },
};

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      currentContext: null,
      recommendations: [],
      derivedSignals: [],
      isLoading: false,
      error: null,

      fetchPreferences: async () => {
        set({ isLoading: true, error: null });
        try {
          // 1. Try reading local Dexie cache first
          const localPref = await db.userPreferences.toCollection().first();
          if (localPref) {
            set({ preferences: localPref, isLoading: false });
          }

          // 2. Fetch from API endpoint if online
          const res = await fetch('/api/personalization/preferences');
          if (res.ok) {
            const data = await res.json();
            if (data.preferences) {
              set({ preferences: data.preferences });
              // Sync to Dexie
              await db.userPreferences.put(data.preferences);
            }
          }
        } catch (err: any) {
          console.warn('[PersonalizationStore] Failed to fetch preferences from server:', err);
          // Fall back to current state or defaults
        } finally {
          set({ isLoading: false });
        }
      },

      updatePreferences: async (updates: UpdateUserPreferencesDTO) => {
        const current = get().preferences || DEFAULT_PREFERENCES;
        const updated: UserPreferences = {
          ...current,
          ...updates,
          categorySlotAffinity: {
            ...current.categorySlotAffinity,
            ...updates.categorySlotAffinity,
          },
          updatedAt: new Date().toISOString(),
        };

        // Optimistic UI update
        set({ preferences: updated });

        // Save locally to Dexie
        try {
          await db.userPreferences.put(updated);
        } catch (err) {
          console.warn('[PersonalizationStore] Dexie update failed:', err);
        }

        // Sync to server API
        try {
          await fetch('/api/personalization/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
        } catch (err) {
          console.warn('[PersonalizationStore] Server sync failed:', err);
        }
      },

      setCurrentContext: (context: CurrentContext) => {
        set({ currentContext: context });
      },

      setRecommendations: (recs: Recommendation[]) => {
        set({ recommendations: recs });
      },

      acceptRecommendation: (id: string) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'accepted' as const } : r
          ),
        }));
      },

      dismissRecommendation: (id: string) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'dismissed' as const } : r
          ),
        }));
      },

      rejectRecommendation: (id: string) => {
        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === id ? { ...r, status: 'rejected' as const } : r
          ),
        }));
      },

      resetAllBehavioralData: async () => {
        try {
          await db.derivedSignals.clear();
          await db.behaviorEvents.clear();
          set({ derivedSignals: [], recommendations: [] });
        } catch (err) {
          console.error('[PersonalizationStore] Reset failed:', err);
        }
      },
    }),
    {
      name: 'meraj_os_personalization_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
