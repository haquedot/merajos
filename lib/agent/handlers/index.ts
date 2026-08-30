import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';
import { TasksActionHandler } from './tasksActionHandler';
import { ProjectsActionHandler } from './projectsActionHandler';
import { NotesActionHandler } from './notesActionHandler';
import { CareerActionHandler } from './careerActionHandler';
import { ResearchActionHandler } from './researchActionHandler';
import { HabitsActionHandler } from './habitsActionHandler';
import { GoalsActionHandler } from './goalsActionHandler';
import { CalendarActionHandler } from './calendarActionHandler';
import { LinksActionHandler } from './linksActionHandler';

const handlerList: ActionHandler[] = [
  new TasksActionHandler(),
  new ProjectsActionHandler(),
  new NotesActionHandler(),
  new CareerActionHandler(),
  new ResearchActionHandler(),
  new HabitsActionHandler(),
  new GoalsActionHandler(),
  new CalendarActionHandler(),
  new LinksActionHandler(),
];

const handlerRegistry: Record<string, ActionHandler> = {};

for (const handler of handlerList) {
  handlerRegistry[handler.module] = handler;
}

// Clients and projects map to the same projectsActionHandler
handlerRegistry['clients'] = handlerRegistry['projects'];

export async function dispatchAgentAction(action: AgentActionProposal, userId: string): Promise<unknown> {
  const handler = handlerRegistry[action.module];
  if (!handler) {
    throw new Error(`Unsupported module: '${action.module}'`);
  }
  return await handler.execute(action, userId);
}
