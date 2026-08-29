import { buildCurrentContext } from '../../personalization/context/contextBuilder';
import { Task, CalendarEvent, DSATopic, SubjectPlan, ResearchPaper } from '../../../types';
import { CurrentContext, UserPreferences } from '../../personalization/types';

export interface ComprehensiveAgentContext {
  currentContext: CurrentContext;
  userPreferences: UserPreferences | null;
  pendingTasks: Task[];
  calendarEvents: CalendarEvent[];
  staleDSATopics: DSATopic[];
  pendingSubjectPlans: SubjectPlan[];
  unreadResearchPapers: ResearchPaper[];
}

export function buildAgentContext(params: {
  tasks: Task[];
  events?: CalendarEvent[];
  preferences?: UserPreferences | null;
  dsaTopics?: DSATopic[];
  subjectPlans?: SubjectPlan[];
  researchPapers?: ResearchPaper[];
}): ComprehensiveAgentContext {
  const {
    tasks,
    events = [],
    preferences = null,
    dsaTopics = [],
    subjectPlans = [],
    researchPapers = []
  } = params;

  const currentContext = buildCurrentContext(tasks, events, preferences);

  // Filter stale DSA topics (e.g., last revised > 7 days or 0 solved)
  const staleDSATopics = dsaTopics.filter((topic) => {
    if (!topic.lastRevised) return true;
    const daysSince = (Date.now() - new Date(topic.lastRevised).getTime()) / (1000 * 3600 * 24);
    return daysSince >= 7;
  });

  // Filter pending subject plans with incomplete topics
  const pendingSubjectPlans = subjectPlans.filter((plan) =>
    plan.topics.some((t) => t.status !== 'mastered')
  );

  // Filter unread or important research papers
  const unreadResearchPapers = researchPapers.filter(
    (p) => p.status === 'unread' || p.isImportant
  );

  return {
    currentContext,
    userPreferences: preferences,
    pendingTasks: tasks.filter((t) => t.status !== 'completed'),
    calendarEvents: events,
    staleDSATopics,
    pendingSubjectPlans,
    unreadResearchPapers
  };
}
