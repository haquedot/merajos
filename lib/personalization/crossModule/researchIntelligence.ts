import { ResearchProject } from '../../../types';

export interface ResearchStagnationAlert {
  projectId: string;
  projectTitle: string;
  daysStagnant: number;
  recommendation: string;
}

export function detectResearchStagnation(
  projects: ResearchProject[] = []
): ResearchStagnationAlert[] {
  const alerts: ResearchStagnationAlert[] = [];
  const now = new Date().getTime();

  for (const proj of projects) {
    if (proj.status === 'active' && proj.updatedAt) {
      const last = new Date(proj.updatedAt).getTime();
      const diffDays = Math.floor((now - last) / (1000 * 3600 * 24));

      if (diffDays >= 7) {
        alerts.push({
          projectId: proj.id,
          projectTitle: proj.title,
          daysStagnant: diffDays,
          recommendation: `Thesis project "${proj.title}" has had no updates in ${diffDays} days. Read 1 paper or write 250 words today.`,
        });
      }
    }
  }

  return alerts;
}
