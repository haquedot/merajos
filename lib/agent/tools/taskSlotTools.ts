import { TaskProposal } from '../types';
import { calculateTaskScore } from '../../personalization/scoring/taskScorer';
import { UserPreferences } from '../../personalization/types';

export function rankAndSlotTaskProposals(
  proposals: TaskProposal[],
  preferences?: UserPreferences | null
): TaskProposal[] {
  // Sort proposals by priority (urgent > high > medium > low) and estimated impact
  const priorityRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

  const scored = proposals.map((prop) => {
    // Adapter to pass TaskProposal into calculateTaskScore
    const mockTask: any = {
      id: prop.id || prop.title,
      title: prop.title,
      priority: prop.priority,
      category: prop.category,
      dueDate: new Date().toISOString().split('T')[0],
      estimatedHours: prop.estimatedHours,
      mit: prop.mit
    };

    const scoreResult = calculateTaskScore(mockTask, { preferences });
    return {
      proposal: prop,
      score: scoreResult.totalScore + (priorityRank[prop.priority] || 1) * 10
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Pick top 3 MITs
  let mitCount = 0;
  const processed = scored.map((item, index) => {
    const prop = item.proposal;
    // Mark top 3 highest scoring items as MIT if not already marked
    let isMit = prop.mit;
    if (!isMit && mitCount < 3 && index < 3) {
      isMit = true;
    }
    if (isMit) mitCount++;

    // Assign optimal default slot if missing
    let slot = prop.timeSlot;
    if (!slot) {
      if (prop.category === 'Career' || prop.category === 'Client') slot = 'morning';
      else if (prop.category === 'Research' || prop.category === 'College') slot = 'afternoon';
      else if (prop.category === 'Personal') slot = 'evening';
      else slot = 'night';
    }

    return {
      ...prop,
      mit: isMit,
      timeSlot: slot
    };
  });

  return processed;
}
