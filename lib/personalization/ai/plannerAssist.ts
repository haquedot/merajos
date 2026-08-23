import { Task } from '../../../types';
import { UserPreferences, CurrentContext } from '../types';

export interface NaturalLanguageTaskSuggestion {
  title: string;
  category: 'Career' | 'Research' | 'Client' | 'Personal';
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
}

export function generateAIPromptForDailyPlanner(
  rawUserInput: string,
  context: CurrentContext | null,
  preferences: UserPreferences | null
): string {
  const role = preferences?.targetRole || 'Software Engineer';
  const slot = context?.currentTimeSlot || 'morning';

  return `System Context: You are Orbit AI Productivity Assistant for a ${role}.
User Current Slot: ${slot}
User Daily Capacity Target: ${preferences?.dailyCapacityHours || 7.0} hours

User Goal Input:
"${rawUserInput}"

Task Instructions:
Parse the input above and suggest 1-3 structured tasks formatted with:
- Title
- Category (Career | Research | Client | Personal)
- Estimated Hours (0.5 to 3.0)
- Priority (low | medium | high | urgent)
- Brief reasoning why it fits today's schedule.`;
}
