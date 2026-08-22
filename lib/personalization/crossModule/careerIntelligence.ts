import { DSATopic, SubjectPlan } from '../../../types';

export interface CareerStagnationAlert {
  topicId: string;
  topicTitle: string;
  daysSinceLastPractice: number;
  recommendation: string;
}

export function detectCareerStagnation(
  dsaTopics: DSATopic[] = [],
  subjectPlans: SubjectPlan[] = []
): CareerStagnationAlert[] {
  const alerts: CareerStagnationAlert[] = [];
  const now = new Date().getTime();

  for (const topic of dsaTopics) {
    if (topic.lastRevised) {
      const last = new Date(topic.lastRevised).getTime();
      const diffDays = Math.floor((now - last) / (1000 * 3600 * 24));

      if (diffDays >= 7) {
        alerts.push({
          topicId: topic.id,
          topicTitle: topic.name,
          daysSinceLastPractice: diffDays,
          recommendation: `No practice logged for "${topic.name}" in ${diffDays} days. Schedule a 30m revision session.`,
        });
      }
    }
  }

  return alerts;
}
