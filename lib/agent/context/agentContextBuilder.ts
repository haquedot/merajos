import { buildCurrentContext } from '../../personalization/context/contextBuilder';
import { Task, CalendarEvent, DSATopic, SubjectPlan, ResearchPaper } from '../../../types';
import { CurrentContext, UserPreferences } from '../../personalization/types';

export interface ModuleSelectiveFlags {
  tasks: boolean;
  projects: boolean;
  notes: boolean;
  habits: boolean;
  goals: boolean;
  career: boolean;
  research: boolean;
  calendar: boolean;
}

export interface ComprehensiveAgentContext {
  currentContext: CurrentContext;
  userPreferences: UserPreferences | null;
  pendingTasks: Task[];
  calendarEvents: CalendarEvent[];
  staleDSATopics: DSATopic[];
  pendingSubjectPlans: SubjectPlan[];
  unreadResearchPapers: ResearchPaper[];
  compactWorkspaceIndex?: string;
}

export function detectRequiredModules(prompt: string): ModuleSelectiveFlags {
  if (!prompt || !prompt.trim()) {
    return { tasks: true, projects: true, notes: true, habits: true, goals: true, career: true, research: true, calendar: true };
  }
  const lower = prompt.toLowerCase();

  // If schedule or workload overview is asked, enable core planning modules
  const isScheduleRequest =
    lower.includes('schedule') ||
    lower.includes('workload') ||
    lower.includes('today') ||
    lower.includes('tomorrow') ||
    lower.includes('plan') ||
    lower.includes('organize');

  return {
    tasks: isScheduleRequest || lower.includes('task') || lower.includes('todo') || lower.includes('mit'),
    projects: isScheduleRequest || lower.includes('project') || lower.includes('client') || lower.includes('freelance'),
    notes: lower.includes('note') || lower.includes('memo') || lower.includes('document') || lower.includes('meeting'),
    habits: lower.includes('habit') || lower.includes('routine') || lower.includes('streak') || lower.includes('gym'),
    goals: lower.includes('goal') || lower.includes('okr') || lower.includes('target'),
    career: lower.includes('career') || lower.includes('dsa') || lower.includes('syllabus') || lower.includes('topic'),
    research: lower.includes('research') || lower.includes('paper') || lower.includes('citation'),
    calendar: isScheduleRequest || lower.includes('calendar') || lower.includes('event') || lower.includes('meeting')
  };
}

export function formatCompactWorkspaceIndex(data: {
  projects?: { title?: string; name?: string; status?: string }[];
  notes?: { title?: string; tags?: string[] }[];
  habits?: { title?: string; streak?: number }[];
  goals?: { title?: string }[];
  tasks?: { title?: string; category?: string; priority?: string }[];
}): string {
  const parts: string[] = [];

  if (data.projects && data.projects.length > 0) {
    const names = data.projects.map((p) => p.name || p.title).filter(Boolean).slice(0, 3).join(', ');
    parts.push(`Projects(${data.projects.length}): ${names}`);
  }

  if (data.notes && data.notes.length > 0) {
    const titles = data.notes.map((n) => n.title).filter(Boolean).slice(0, 3).join(', ');
    parts.push(`Notes(${data.notes.length}): ${titles}`);
  }

  if (data.habits && data.habits.length > 0) {
    const habitStr = data.habits.map((h) => `${h.title}${h.streak ? ` (${h.streak}d streak)` : ''}`).slice(0, 3).join(', ');
    parts.push(`Habits(${data.habits.length}): ${habitStr}`);
  }

  if (data.goals && data.goals.length > 0) {
    const goalTitles = data.goals.map((g) => g.title).filter(Boolean).slice(0, 3).join(', ');
    parts.push(`Goals(${data.goals.length}): ${goalTitles}`);
  }

  if (data.tasks && data.tasks.length > 0) {
    const taskTitles = data.tasks.map((t) => t.title).filter(Boolean).slice(0, 4).join(', ');
    parts.push(`Tasks(${data.tasks.length}): ${taskTitles}`);
  }

  if (parts.length === 0) return 'Workspace State: Fresh Workspace (No active items)';
  return `=== WORKSPACE INDEX ===\n${parts.join(' | ')}`;
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
