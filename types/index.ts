export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type Category = 'Client' | 'Research' | 'Career' | 'Personal' | 'College' | 'Habit';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type RecurringOption = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  googleTaskId?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category: Category;
  projectId?: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string; // YYYY-MM-DD
  time?: string; // HH:mm
  recurring: RecurringOption;
  tags: string[];
  notes?: string;
  mit: boolean; // Most Important Task
  timeSlot?: TimeSlot;
  createdAt?: string;
  completedAt?: string;
  lastSyncedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface CalendarEvent {
  id: string;
  googleEventId?: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  color: string;
  category: Category;
  taskId?: string;
  lastSyncedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface ProjectFeature {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectBug {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold';
  progress: number; // 0 to 100
  estimatedHours: number;
  actualHours: number;
  deadline: string;
  features: ProjectFeature[];
  bugs: ProjectBug[];
  techStack: string[];
}

export type PaperStatus = 'unread' | 'reading' | 'cited' | 'archived';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  notes: string;
  citation: string;
  status: PaperStatus;
  priority: Priority;
  tags: string[];
  pdfUrl?: string;
  readingTimeMinutes: number;
}

export interface WritingSection {
  id: string;
  section: string;
  targetWords: number;
  currentWords: number;
  status: 'not_started' | 'drafting' | 'reviewing' | 'completed';
}

export interface ResearchOverview {
  topic: string;
  thesisTitle: string;
  paperTitle: string;
  progress: number;
  hoursSpent: number;
  papersRead: number;
  writingProgress: number;
}

export type JobStatus = 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Offer';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: JobStatus;
  salary: string;
  location: string;
  notes: string;
  link?: string;
}

export interface InterviewChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface InterviewTopic {
  id: string;
  category: 'React' | 'Next.js' | 'JavaScript' | 'TypeScript' | 'Node.js' | 'Express' | 'MongoDB' | 'Authentication' | 'Performance' | 'System Design';
  progress: number;
  notes: string;
  resources: { title: string; url: string }[];
  checklist: InterviewChecklistItem[];
}

export interface DSATopic {
  id: string;
  name: string;
  category: string;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  notes: string;
  lastRevised: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  icon: string;
  targetDaysPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
}

export type GoalTier = 'long_term' | 'quarter' | 'monthly' | 'weekly' | 'daily';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  tier: GoalTier;
  targetDate: string;
  progress: number;
  priority: Priority;
  milestones: Milestone[];
  completed: boolean;
}

export interface WeeklyPlan {
  weekId: string;
  topPriorities: string[];
  researchGoals: string[];
  careerGoals: string[];
  clientGoals: string[];
  personalGoals: string[];
  brainDump: string;
  nextWeekGoals: string[];
  review: {
    wins: string;
    losses: string;
    improvements: string;
    score: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  folder: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  sidebarCollapsed: boolean;
  pomodoroTime: number;
  soundEnabled: boolean;
}
