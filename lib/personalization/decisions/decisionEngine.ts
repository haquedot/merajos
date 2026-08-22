import { Task, Goal } from '../../../types';
import { Recommendation, UserPreferences, CurrentContext } from '../types';
import { evaluateTaskConstraints } from '../constraints/constraintEvaluator';
import { calculateTaskScore } from '../scoring/taskScorer';

export function generateTodayRecommendations(
  tasks: Task[],
  options: {
    goals?: Goal[];
    context?: CurrentContext | null;
    preferences?: UserPreferences | null;
  } = {}
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { goals = [], context = null, preferences = null } = options;

  // 1. Evaluate candidate constraints
  const { eligibleTasks } = evaluateTaskConstraints(tasks, context);
  if (eligibleTasks.length === 0) return recommendations;

  // 2. Score eligible pending tasks
  const currentSlot = context?.currentTimeSlot || 'morning';
  const scored = eligibleTasks.map((task) => {
    const scoreResult = calculateTaskScore(task, {
      activeGoals: goals,
      currentSlot,
      preferences,
    });
    return { task, scoreResult };
  });

  // Sort descending by totalScore
  scored.sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

  // 3. Generate Top 3 MIT recommendations
  const topCandidates = scored.slice(0, Math.min(3, preferences?.maxDailyMITs || 3));

  for (let i = 0; i < topCandidates.length; i++) {
    const { task, scoreResult } = topCandidates[i];

    const evidence = scoreResult.factors
      .filter((f) => f.score !== 0)
      .map((f) => f.explanation);

    const primaryReason =
      scoreResult.hardConstraintApplied ||
      evidence[0] ||
      'Highest dynamic impact score for today';

    recommendations.push({
      id: `rec_mit_${task.id}_${Date.now()}_${i}`,
      type: 'mit_suggestion',
      entityId: task.id,
      title: `Recommended MIT: ${task.title}`,
      reason: primaryReason,
      confidence: scoreResult.confidence,
      evidence,
      score: Math.round(scoreResult.totalScore),
      factors: scoreResult.factors,
      source: task.dueDate ? 'deadline_urgency' : 'behavioral_pattern',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(), // 12h validity
      status: 'shown',
    });
  }

  return recommendations;
}
