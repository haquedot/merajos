import {
  Task,
  CalendarEvent,
  Project,
  ResearchProject,
  JobApplication,
  InterviewTopic,
  DSATopic,
  Habit,
  Goal,
  WeeklyPlan,
  Note,
  UserSettings,
} from '../types';

export const INITIAL_TASKS: Task[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_RESEARCH_PROJECTS: ResearchProject[] = [];
export const INITIAL_JOBS: JobApplication[] = [];
export const INITIAL_INTERVIEW_TOPICS: InterviewTopic[] = [];
export const INITIAL_DSA_TOPICS: DSATopic[] = [];
export const INITIAL_HABITS: Habit[] = [];
export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_WEEKLY_PLAN: WeeklyPlan = {
  weekId: '',
  topPriorities: [],
  researchGoals: [],
  careerGoals: [],
  clientGoals: [],
  personalGoals: [],
  brainDump: '',
  nextWeekGoals: [],
  review: {
    wins: '',
    losses: '',
    improvements: '',
    score: 0,
  },
};

export const INITIAL_NOTES: Note[] = [];

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'light',
  accentColor: '#3b82f6',
  sidebarCollapsed: false,
  pomodoroTime: 25,
  soundEnabled: true,
  emailNotificationsEnabled: true,
  notificationEmail: '',
  onboarding: {
    displayName: '',
    role: 'custom',
    enabledModules: [
      'tasks',
      'calendar',
      'habits',
      'goals',
      'notes',
      'weekly_planner',
      'analytics',
      'clients',
      'research',
      'career',
    ],
    workStartTime: '09:00',
    workEndTime: '18:00',
    primaryGoal: '',
    onboardingCompleted: false,
  },
};

export const INITIAL_EVENTS: CalendarEvent[] = [];

export const initialSeedData = {
  tasks: [],
  projects: [],
  researchProjects: [],
  jobs: [],
  interviewTopics: [],
  dsaTopics: [],
  habits: [],
  goals: [],
  weeklyPlan: INITIAL_WEEKLY_PLAN,
  notes: [],
  settings: INITIAL_SETTINGS,
  events: [],
};
