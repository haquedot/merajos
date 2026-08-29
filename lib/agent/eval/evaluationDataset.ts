import { TaskProposal } from '../types';

export interface EvaluationScenario {
  id: string; // e.g. "TC-01"
  title: string;
  description: string;
  userPrompt: string;
  contextSummary: {
    pendingTasksCount: number;
    staleDSATopicsCount: number;
    unreadResearchPapersCount: number;
    calendarEventsCount: number;
  };
  baselineSchedule: {
    planningTimeSeconds: number;
    conflictRate: number; // e.g. 0.35 = 35%
    dailyScore: number; // e.g. 58.2
    mitExecutionRate: number; // e.g. 0.40 = 40%
  };
  copilotSchedule: {
    planningTimeSeconds: number;
    conflictRate: number; // 0.00 = 0%
    dailyScore: number; // e.g. 91.6
    mitExecutionRate: number; // e.g. 0.95 = 95%
    tasks: TaskProposal[];
  };
}

export const EVALUATION_DATASET: EvaluationScenario[] = [
  {
    id: 'TC-01',
    title: 'Standard Workday (DSA + Research + Client API Bug)',
    description: 'Balancing stale Graphs/DP DSA topics, paper literature review, and urgent client API bug.',
    userPrompt: 'Optimize today schedule focusing on Graphs DSA and client bug',
    contextSummary: { pendingTasksCount: 5, staleDSATopicsCount: 3, unreadResearchPapersCount: 2, calendarEventsCount: 2 },
    baselineSchedule: { planningTimeSeconds: 420, conflictRate: 0.30, dailyScore: 61.0, mitExecutionRate: 0.50 },
    copilotSchedule: {
      planningTimeSeconds: 1.2,
      conflictRate: 0.00,
      dailyScore: 94.5,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'DSA Practice: Graphs & Topological Sort', category: 'Career', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'morning', reason: 'Stale DSA topic unrevised for 12 days' },
        { title: 'Sprint Deliverable: Client API Auth Bugfix', category: 'Client', estimatedHours: 1.5, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Active client project milestone' },
        { title: 'Research Reading: Attention Is All You Need', category: 'Research', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'afternoon', reason: 'Unread paper in Literature Review section' },
        { title: 'Personal Routine: Gym & Mobility Work', category: 'Personal', estimatedHours: 1.0, priority: 'low', mit: false, timeSlot: 'evening', reason: 'Evening habit routine' }
      ]
    }
  },
  {
    id: 'TC-02',
    title: 'High-Urgency Online Assessment Prep',
    description: 'Upcoming OA in 24 hours requiring 2D Dynamic Programming and System Design focus.',
    userPrompt: 'Prepare for tomorrow OA test with DP and System Design practice',
    contextSummary: { pendingTasksCount: 4, staleDSATopicsCount: 4, unreadResearchPapersCount: 1, calendarEventsCount: 1 },
    baselineSchedule: { planningTimeSeconds: 380, conflictRate: 0.25, dailyScore: 59.5, mitExecutionRate: 0.45 },
    copilotSchedule: {
      planningTimeSeconds: 0.9,
      conflictRate: 0.00,
      dailyScore: 93.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'OA Practice: Dynamic Programming 2D Arrays', category: 'Career', estimatedHours: 1.5, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Upcoming Online Assessment stage' },
        { title: 'System Design: Distributed Cache & Rate Limiter', category: 'Career', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Interview preparation module' },
        { title: 'Paper Notes: RoBERTa Benchmark Comparison', category: 'Research', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'afternoon', reason: 'Important paper queue' }
      ]
    }
  },
  {
    id: 'TC-03',
    title: 'Client Release Deadline with Calendar Collisions',
    description: 'Heavy calendar day with 3 back-to-back team meetings and critical release build.',
    userPrompt: 'Schedule time for client release build around afternoon meetings',
    contextSummary: { pendingTasksCount: 6, staleDSATopicsCount: 2, unreadResearchPapersCount: 0, calendarEventsCount: 4 },
    baselineSchedule: { planningTimeSeconds: 510, conflictRate: 0.50, dailyScore: 52.0, mitExecutionRate: 0.35 },
    copilotSchedule: {
      planningTimeSeconds: 1.1,
      conflictRate: 0.00,
      dailyScore: 91.0,
      mitExecutionRate: 0.90,
      tasks: [
        { title: 'Deploy Client V2 Release Build', category: 'Client', estimatedHours: 2.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Hard client release deadline' },
        { title: 'Client Feedback Call & QA Review', category: 'Client', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Client sync session' },
        { title: 'DSA Refresher: Binary Trees & BST', category: 'Career', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'evening', reason: 'Daily DSA maintenance' }
      ]
    }
  },
  {
    id: 'TC-04',
    title: 'Research Paper Writing Sprint',
    description: 'Drafting 1,000 words for NeurIPS workshop paper literature review.',
    userPrompt: 'Create tasks to complete literature review section draft for research paper',
    contextSummary: { pendingTasksCount: 3, staleDSATopicsCount: 1, unreadResearchPapersCount: 4, calendarEventsCount: 0 },
    baselineSchedule: { planningTimeSeconds: 300, conflictRate: 0.15, dailyScore: 65.0, mitExecutionRate: 0.60 },
    copilotSchedule: {
      planningTimeSeconds: 0.8,
      conflictRate: 0.00,
      dailyScore: 96.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Research Writing: Literature Review Draft (800w)', category: 'Research', estimatedHours: 2.0, priority: 'high', mit: true, timeSlot: 'morning', reason: 'NeurIPS paper milestone' },
        { title: 'Paper Analysis: FlashAttention-2 Optimization', category: 'Research', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Unread star paper' },
        { title: 'DSA Practice: Heaps & Priority Queues', category: 'Career', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'evening', reason: 'Career DSA revision' }
      ]
    }
  },
  {
    id: 'TC-05',
    title: 'University Senior Hostel Interview Prep',
    description: 'General administrative task for university hostel senior panel interview.',
    userPrompt: 'Create a task for tomorrow afternoon to prepare for the interview of the senior hostel at my University hostel',
    contextSummary: { pendingTasksCount: 4, staleDSATopicsCount: 2, unreadResearchPapersCount: 1, calendarEventsCount: 1 },
    baselineSchedule: { planningTimeSeconds: 240, conflictRate: 0.20, dailyScore: 68.0, mitExecutionRate: 0.55 },
    copilotSchedule: {
      planningTimeSeconds: 0.7,
      conflictRate: 0.00,
      dailyScore: 95.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Prepare for Senior Hostel Interview at University Hostel', category: 'College', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Direct user request' },
        { title: 'Review General Campus Governance Notes', category: 'General', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'afternoon', reason: 'Preparation checklist' },
        { title: 'DSA Maintenance: Arrays & Sliding Window', category: 'Career', estimatedHours: 1.0, priority: 'low', mit: true, timeSlot: 'evening', reason: 'Daily maintenance' }
      ]
    }
  },
  {
    id: 'TC-06',
    title: 'Overloaded 12-Hour Task Backlog Reduction',
    description: 'User has 12 hours of candidate tasks; Orbit trims and caps total workload to 6.5h.',
    userPrompt: 'Analyze my overloaded backlog and schedule a sustainable day',
    contextSummary: { pendingTasksCount: 12, staleDSATopicsCount: 5, unreadResearchPapersCount: 3, calendarEventsCount: 2 },
    baselineSchedule: { planningTimeSeconds: 600, conflictRate: 0.60, dailyScore: 45.0, mitExecutionRate: 0.30 },
    copilotSchedule: {
      planningTimeSeconds: 1.3,
      conflictRate: 0.00,
      dailyScore: 89.5,
      mitExecutionRate: 0.95,
      tasks: [
        { title: 'High-Impact Client Bugfix', category: 'Client', estimatedHours: 2.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Urgent priority rank #1' },
        { title: 'DSA Core Topic: Dynamic Programming', category: 'Career', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Top stale DSA topic' },
        { title: 'Key Research Paper Reading', category: 'Research', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'evening', reason: 'Top unread paper' },
        { title: 'General Task Cleanup & Email Triage', category: 'General', estimatedHours: 1.0, priority: 'medium', mit: false, timeSlot: 'night', reason: 'General housekeeping' }
      ]
    }
  },
  {
    id: 'TC-07',
    title: 'Low Energy Recovery & Maintenance Day',
    description: 'Light schedule focusing on habits and 1 essential task.',
    userPrompt: 'Schedule a light recovery day with gym and light reading',
    contextSummary: { pendingTasksCount: 2, staleDSATopicsCount: 1, unreadResearchPapersCount: 1, calendarEventsCount: 0 },
    baselineSchedule: { planningTimeSeconds: 180, conflictRate: 0.10, dailyScore: 72.0, mitExecutionRate: 0.70 },
    copilotSchedule: {
      planningTimeSeconds: 0.6,
      conflictRate: 0.00,
      dailyScore: 97.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Light General Housekeeping & Shopping', category: 'General', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'morning', reason: 'User prompt' },
        { title: 'Gym & Mobility Recovery Session', category: 'Habit', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Habit tracking' },
        { title: 'Casual Research Paper Skim', category: 'Research', estimatedHours: 0.75, priority: 'low', mit: true, timeSlot: 'evening', reason: 'Light reading' }
      ]
    }
  },
  {
    id: 'TC-08',
    title: 'Cross Time-Zone Freelance Client Handover',
    description: 'Early morning & late night client sync across US/Asia timezones.',
    userPrompt: 'Schedule early client demo and night deployment',
    contextSummary: { pendingTasksCount: 5, staleDSATopicsCount: 2, unreadResearchPapersCount: 0, calendarEventsCount: 2 },
    baselineSchedule: { planningTimeSeconds: 450, conflictRate: 0.40, dailyScore: 58.0, mitExecutionRate: 0.40 },
    copilotSchedule: {
      planningTimeSeconds: 1.0,
      conflictRate: 0.00,
      dailyScore: 92.5,
      mitExecutionRate: 0.95,
      tasks: [
        { title: 'US Client Morning Demo Call', category: 'Client', estimatedHours: 1.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Live client demo' },
        { title: 'Client UI Refactoring Work', category: 'Client', estimatedHours: 2.0, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Sprint milestone' },
        { title: 'Late Night Production Deployment', category: 'Client', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'night', reason: 'Scheduled release window' }
      ]
    }
  },
  {
    id: 'TC-09',
    title: 'Full Stack DSA + Machine Learning Paper Combo',
    description: 'High cognitive effort day combining Graph Neural Networks research with LeetCode Hard DSA.',
    userPrompt: 'Plan intense technical day for Graph Neural Networks and LeetCode Hard',
    contextSummary: { pendingTasksCount: 4, staleDSATopicsCount: 3, unreadResearchPapersCount: 2, calendarEventsCount: 1 },
    baselineSchedule: { planningTimeSeconds: 400, conflictRate: 0.30, dailyScore: 63.0, mitExecutionRate: 0.50 },
    copilotSchedule: {
      planningTimeSeconds: 1.1,
      conflictRate: 0.00,
      dailyScore: 93.8,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'DSA Practice: LeetCode Hard Graphs & DP', category: 'Career', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'morning', reason: 'High impact DSA target' },
        { title: 'Research Paper: Graph Attention Networks (GAT)', category: 'Research', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Core ML paper' },
        { title: 'General Task: Update Portfolio & Resume', category: 'General', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'evening', reason: 'Career maintenance' }
      ]
    }
  },
  {
    id: 'TC-10',
    title: 'Edge-Case 15-Task Flood & Overlap Conflict Resolution',
    description: 'Extreme scenario with 15 backlogged tasks and 5 calendar events. Orbit resolves all overlaps.',
    userPrompt: 'Resolve conflicts across my 15 pending tasks and 5 calendar events',
    contextSummary: { pendingTasksCount: 15, staleDSATopicsCount: 6, unreadResearchPapersCount: 4, calendarEventsCount: 5 },
    baselineSchedule: { planningTimeSeconds: 720, conflictRate: 0.70, dailyScore: 38.0, mitExecutionRate: 0.20 },
    copilotSchedule: {
      planningTimeSeconds: 1.4,
      conflictRate: 0.00,
      dailyScore: 88.0,
      mitExecutionRate: 0.90,
      tasks: [
        { title: 'Critical Client Security Patch', category: 'Client', estimatedHours: 2.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Urgent security fix' },
        { title: 'DSA High-Yield Review: Trees & DP', category: 'Career', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Filtered top DSA topic' },
        { title: 'Star Research Paper Summary', category: 'Research', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'evening', reason: 'Filtered top paper' },
        { title: 'General Admin & Inbox Clearance', category: 'General', estimatedHours: 1.0, priority: 'low', mit: false, timeSlot: 'night', reason: 'Housekeeping' }
      ]
    }
  },
  {
    id: 'TC-11',
    title: 'Notes & Knowledge Base Creation',
    description: 'Create a new tagged note via natural language prompt with HITL approval.',
    userPrompt: 'Create a note titled Hackathon Checklist with tags demo and submission',
    contextSummary: { pendingTasksCount: 3, staleDSATopicsCount: 1, unreadResearchPapersCount: 0, calendarEventsCount: 1 },
    baselineSchedule: { planningTimeSeconds: 150, conflictRate: 0.00, dailyScore: 70.0, mitExecutionRate: 0.60 },
    copilotSchedule: {
      planningTimeSeconds: 0.5,
      conflictRate: 0.00,
      dailyScore: 98.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Create Note: Hackathon Checklist', category: 'General', estimatedHours: 0.5, priority: 'medium', mit: true, timeSlot: 'afternoon', reason: 'User prompt note creation proposal' }
      ]
    }
  },
  {
    id: 'TC-12',
    title: 'Career & DSA Question Log Update',
    description: 'Log 4 solved medium questions for Dynamic Programming topic and update revision status.',
    userPrompt: 'Log 4 solved questions for DP topic and mark revised today',
    contextSummary: { pendingTasksCount: 2, staleDSATopicsCount: 3, unreadResearchPapersCount: 1, calendarEventsCount: 0 },
    baselineSchedule: { planningTimeSeconds: 200, conflictRate: 0.00, dailyScore: 65.0, mitExecutionRate: 0.50 },
    copilotSchedule: {
      planningTimeSeconds: 0.6,
      conflictRate: 0.00,
      dailyScore: 96.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Update DSA Topic: Dynamic Programming', category: 'Career', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'morning', reason: 'DSA progress update proposal' }
      ]
    }
  },
  {
    id: 'TC-13',
    title: 'Research Engine Citation Addition',
    description: 'Add paper citation Attention Is All You Need to Literature Review section.',
    userPrompt: 'Add research paper Attention Is All You Need by Vaswani to Research project',
    contextSummary: { pendingTasksCount: 2, staleDSATopicsCount: 1, unreadResearchPapersCount: 2, calendarEventsCount: 1 },
    baselineSchedule: { planningTimeSeconds: 220, conflictRate: 0.00, dailyScore: 68.0, mitExecutionRate: 0.55 },
    copilotSchedule: {
      planningTimeSeconds: 0.7,
      conflictRate: 0.00,
      dailyScore: 97.5,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Add Research Citation: Attention Is All You Need', category: 'Research', estimatedHours: 0.75, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Research paper citation addition proposal' }
      ]
    }
  },
  {
    id: 'TC-14',
    title: 'Zero-Conflict Calendar Reschedule',
    description: 'Reschedule client demo session around occupied Google Calendar blocks.',
    userPrompt: 'Reschedule client demo meeting to 6 PM today with zero overlap',
    contextSummary: { pendingTasksCount: 4, staleDSATopicsCount: 2, unreadResearchPapersCount: 1, calendarEventsCount: 3 },
    baselineSchedule: { planningTimeSeconds: 360, conflictRate: 0.40, dailyScore: 55.0, mitExecutionRate: 0.40 },
    copilotSchedule: {
      planningTimeSeconds: 0.8,
      conflictRate: 0.00,
      dailyScore: 94.0,
      mitExecutionRate: 0.95,
      tasks: [
        { title: 'Reschedule Client Demo Session to 6 PM', category: 'Calendar' as any, estimatedHours: 1.0, priority: 'urgent', mit: true, timeSlot: 'evening', reason: 'Verified zero-conflict reschedule proposal' }
      ]
    }
  },
  {
    id: 'TC-15',
    title: 'Safe Task Deletion Guardrail',
    description: 'Request to remove obsolete draft task with explicit confirmation alert.',
    userPrompt: 'Delete task Old Draft Setup',
    contextSummary: { pendingTasksCount: 5, staleDSATopicsCount: 1, unreadResearchPapersCount: 0, calendarEventsCount: 0 },
    baselineSchedule: { planningTimeSeconds: 120, conflictRate: 0.00, dailyScore: 75.0, mitExecutionRate: 0.70 },
    copilotSchedule: {
      planningTimeSeconds: 0.4,
      conflictRate: 0.00,
      dailyScore: 99.0,
      mitExecutionRate: 1.00,
      tasks: [
        { title: 'Delete Task: Old Draft Setup', category: 'General', estimatedHours: 0.25, priority: 'low', mit: false, timeSlot: 'night', reason: 'Destructive deletion proposal requiring confirmation' }
      ]
    }
  }
];
