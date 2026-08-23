import { db } from '../../../database/dexie';
import { UserPreferences, DerivedSignal, BehaviorEvent } from '../types';
import { Task, Goal } from '../../../types';

export async function seedPersonalizationTestData(): Promise<{
  preferences: UserPreferences;
  signals: DerivedSignal[];
  events: BehaviorEvent[];
  tasks: Task[];
  goals: Goal[];
}> {
  if (typeof window === 'undefined') {
    throw new Error('Dexie seeding must run in a browser context.');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Seed User Preferences
  const samplePreferences: UserPreferences = {
    userId: '6a84690dd0d07ce2d71b0c47',
    userEmail: 'haquedot@gmail.com',
    targetRole: 'Senior Full-Stack Architect',
    preferredFocusDurationMinutes: 45,
    maxDailyMITs: 3,
    dailyCapacityHours: 7.0,
    personalizationEnabled: true,
    learnFromTaskBehavior: true,
    learnFromFocusSessions: true,
    learnFromHabits: true,
    categorySlotAffinity: {
      Career: 'morning',
      Research: 'afternoon',
      Client: 'morning',
      Personal: 'evening',
      College: 'morning',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.userPreferences.put(samplePreferences);

  // 2. Seed Derived Signals
  const sampleSignals: DerivedSignal[] = [
    {
      userId: 'test-user-001',
      signalKey: 'career_morning_completion_affinity',
      category: 'Career',
      timeSlot: 'morning',
      value: 0.88,
      sampleSize: 28,
      confidence: 0.92,
      lastObservedAt: new Date().toISOString(),
      observationWindowDays: 30,
      recencyWeight: 1.0,
      baseline: 0.5,
    },
    {
      userId: 'test-user-001',
      signalKey: 'research_afternoon_completion_affinity',
      category: 'Research',
      timeSlot: 'afternoon',
      value: 0.79,
      sampleSize: 18,
      confidence: 0.84,
      lastObservedAt: new Date().toISOString(),
      observationWindowDays: 30,
      recencyWeight: 0.95,
      baseline: 0.5,
    },
    {
      userId: 'test-user-001',
      signalKey: 'client_morning_completion_affinity',
      category: 'Client',
      timeSlot: 'morning',
      value: 0.91,
      sampleSize: 34,
      confidence: 0.95,
      lastObservedAt: new Date().toISOString(),
      observationWindowDays: 30,
      recencyWeight: 1.0,
      baseline: 0.5,
    },
  ];
  for (const sig of sampleSignals) {
    await db.derivedSignals.put(sig);
  }

  // 3. Seed Behavior Events (15 events)
  const sampleEvents: BehaviorEvent[] = [];
  const eventTypes = ['TASK_COMPLETED', 'FOCUS_SESSION_COMPLETED', 'HABIT_CHECKED'] as const;
  const categories = ['Career', 'Research', 'Client', 'Personal'];
  const slots = ['morning', 'afternoon', 'evening', 'night'] as const;

  for (let i = 1; i <= 15; i++) {
    const evt: BehaviorEvent = {
      id: `evt_seed_${i}_${Date.now()}`,
      userId: 'test-user-001',
      eventType: eventTypes[i % eventTypes.length],
      entityId: `task_seed_${i}`,
      metadata: {
        category: categories[i % categories.length],
        timeSlot: slots[i % slots.length],
        plannedDuration: 45,
        actualDuration: 42,
      },
      timestamp: new Date(Date.now() - i * 3600 * 1000 * 12).toISOString(),
    };
    sampleEvents.push(evt);
    await db.behaviorEvents.put(evt);
  }

  // 4. Seed Tasks for Today
  const sampleTasks: Task[] = [
    {
      id: 'task_seed_1',
      title: 'Design Microservices Personalization Architecture Blueprint',
      description: 'System design for deterministic task scoring and confidence algorithms',
      priority: 'high',
      status: 'todo',
      category: 'Career',
      estimatedHours: 2.5,
      actualHours: 0,
      dueDate: todayStr,
      time: '09:00',
      timeSlot: 'morning',
      recurring: 'none',
      tags: ['Architecture', 'Personalization', 'System Design'],
      mit: false,
    },
    {
      id: 'task_seed_2',
      title: 'Literature Review on Distributed Vector Embeddings',
      description: 'Analyze 3 research papers on local vector indexing',
      priority: 'high',
      status: 'todo',
      category: 'Research',
      estimatedHours: 2.0,
      actualHours: 0,
      dueDate: todayStr,
      time: '14:00',
      timeSlot: 'afternoon',
      recurring: 'none',
      tags: ['Research', 'ML', 'Vector Search'],
      mit: false,
    },
    {
      id: 'task_seed_3',
      title: 'Optimize Database Compound Query Indexes',
      description: 'Add indexes for userId and status on MongoDB models',
      priority: 'urgent',
      status: 'todo',
      category: 'Client',
      estimatedHours: 1.5,
      actualHours: 0,
      dueDate: todayStr,
      time: '10:30',
      timeSlot: 'morning',
      recurring: 'none',
      tags: ['Database', 'Performance', 'MongoDB'],
      mit: false,
    },
  ];
  for (const t of sampleTasks) {
    await db.tasks.put(t);
  }

  // 5. Seed Goals
  const sampleGoals: Goal[] = [
    {
      id: 'goal_seed_1',
      title: 'Achieve Senior Full-Stack Architect Position',
      description: 'Master system design, distributed databases, and personalization algorithms',
      tier: 'long_term',
      targetDate: '2026-12-31',
      progress: 65,
      priority: 'high',
      milestones: [
        { id: 'm1', title: 'Complete Personalization Architecture Blueprint', completed: true },
        { id: 'm2', title: 'Implement Deterministic Scoring Engine', completed: true },
      ],
      completed: false,
    },
  ];
  for (const g of sampleGoals) {
    await db.goals.put(g);
  }

  return {
    preferences: samplePreferences,
    signals: sampleSignals,
    events: sampleEvents,
    tasks: sampleTasks,
    goals: sampleGoals,
  };
}
