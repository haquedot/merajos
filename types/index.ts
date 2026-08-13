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
  eventId?: string;
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
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
}

export interface ProjectBug {
  id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt?: string;
}

export interface ProjectInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress: number; // 0 to 100
  budget?: number;
  amountPaid?: number;
  currency?: string;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  deadline: string;
  color?: string;
  features: ProjectFeature[];
  bugs: ProjectBug[];
  invoices?: ProjectInvoice[];
  techStack: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Research Module ──────────────────────────────────────────────────────────

export type PaperStatus = 'unread' | 'reading' | 'cited' | 'skimmed' | 'archived';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;            // e.g. "ArXiv", "IEEE", "NeurIPS 2024"
  pdfUrl?: string;
  doi?: string;
  status: PaperStatus;
  isImportant: boolean;      // ⭐ star flag
  summary: string;           // user-written summary
  notes: string;             // raw highlights / personal notes
  citation: string;          // formatted citation string
  tags: string[];
  readingTimeMinutes: number;
  addedAt: string;           // ISO date string
}

export type ResearchSectionType =
  | 'literature_review'
  | 'datasets'
  | 'algorithms'
  | 'diagrams'
  | 'writing'
  | 'notes'
  | 'custom';

export interface ResearchSection {
  id: string;
  type: ResearchSectionType;
  title: string;
  description?: string;
  papers?: ResearchPaper[];         // for literature_review
  targetWords?: number;             // for writing
  currentWords?: number;            // for writing
  writingStatus?: 'not_started' | 'drafting' | 'reviewing' | 'completed';
  content?: string;                 // for notes / custom / generic
  createdAt: string;
  order: number;
}

export type ResearchStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface ResearchProject {
  id: string;
  title: string;
  description?: string;
  field?: string;            // e.g. "Machine Learning", "Bioinformatics"
  status: ResearchStatus;
  progress: number;          // 0–100
  color?: string;            // accent color
  sections: ResearchSection[];
  createdAt: string;
  updatedAt: string;
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

export type UserRole = 'student' | 'freelancer' | 'researcher' | 'professional' | 'custom';

export type ModuleKey =
  | 'tasks'
  | 'calendar'
  | 'habits'
  | 'goals'
  | 'notes'
  | 'weekly_planner'
  | 'analytics'
  | 'clients'
  | 'research'
  | 'career';

export interface OnboardingProfile {
  displayName: string;
  role: UserRole;
  enabledModules: ModuleKey[];
  workStartTime: string;    // "09:00"
  workEndTime: string;      // "18:00"
  primaryGoal: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
}

export interface UserSettings {
  id?: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  sidebarCollapsed: boolean;
  pomodoroTime: number;
  soundEnabled: boolean;
  emailNotificationsEnabled?: boolean;
  notificationEmail?: string;
  onboarding?: OnboardingProfile;
}
