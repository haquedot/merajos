export interface TaskScoreFactor {
  name: string;
  weight: number;
  value: number;
  score: number;
  explanation: string;
}

export interface TaskScoreResult {
  taskId: string;
  totalScore: number;
  confidence: number;
  factors: TaskScoreFactor[];
  hardConstraintApplied?: string;
}

export type RecommendationType =
  | 'mit_suggestion'
  | 'slot_move_suggestion'
  | 'workload_warning'
  | 'breakdown_alert';

export type RecommendationStatus =
  | 'shown'
  | 'accepted'
  | 'dismissed'
  | 'rejected'
  | 'expired';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  entityId?: string;
  title: string;
  reason: string;
  confidence: number;
  evidence: string[];
  score?: number;
  factors?: TaskScoreFactor[];
  source: 'behavioral_pattern' | 'explicit_preference' | 'deadline_urgency';
  createdAt: string;
  expiresAt: string;
  status: RecommendationStatus;
}
