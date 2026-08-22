export type BehaviorEventType =
  | 'TASK_COMPLETED'
  | 'TASK_POSTPONED'
  | 'TASK_SLOT_CHANGED'
  | 'FOCUS_SESSION_COMPLETED'
  | 'HABIT_CHECKED'
  | 'GOAL_MILESTONE_REACHED'
  | 'RECOMMENDATION_ACCEPTED'
  | 'RECOMMENDATION_REJECTED';

export interface BehaviorEvent {
  id: string;
  userId: string;
  eventType: BehaviorEventType;
  entityId: string;
  metadata?: {
    category?: string;
    timeSlot?: string;
    plannedDuration?: number;
    actualDuration?: number;
    [key: string]: any;
  };
  timestamp: string;
}

export interface DerivedSignal {
  id?: string;
  userId: string;
  signalKey: string;
  category?: string;
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
  value: number;
  sampleSize: number;
  confidence: number;
  lastObservedAt: string;
  observationWindowDays: number;
  recencyWeight: number;
  baseline: number;
}
