export interface CategorySlotAffinityMap {
  Career?: 'morning' | 'afternoon' | 'evening' | 'night';
  Research?: 'morning' | 'afternoon' | 'evening' | 'night';
  Client?: 'morning' | 'afternoon' | 'evening' | 'night';
  Personal?: 'morning' | 'afternoon' | 'evening' | 'night';
  College?: 'morning' | 'afternoon' | 'evening' | 'night';
  [key: string]: 'morning' | 'afternoon' | 'evening' | 'night' | undefined;
}

export interface UserPreferences {
  userId: string;
  userEmail: string;
  targetRole: string;
  preferredFocusDurationMinutes: number;
  maxDailyMITs: number;
  dailyCapacityHours: number;
  personalizationEnabled: boolean;
  learnFromTaskBehavior: boolean;
  learnFromFocusSessions: boolean;
  learnFromHabits: boolean;
  categorySlotAffinity: CategorySlotAffinityMap;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPreferencesDTO {
  targetRole?: string;
  preferredFocusDurationMinutes?: number;
  maxDailyMITs?: number;
  dailyCapacityHours?: number;
  personalizationEnabled?: boolean;
  learnFromTaskBehavior?: boolean;
  learnFromFocusSessions?: boolean;
  learnFromHabits?: boolean;
  categorySlotAffinity?: CategorySlotAffinityMap;
}
