import { z } from 'zod';

export const TaskSchemaValidation = z.object({
  id: z.string().optional(),
  googleTaskId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed', 'archived']).default('todo'),
  category: z.enum(['Client', 'Research', 'Career', 'Personal', 'College', 'Habit']).default('Personal'),
  projectId: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional().default(0),
  actualHours: z.number().nonnegative().optional().default(0),
  dueDate: z.string().min(1, 'Due date is required'),
  time: z.string().optional(),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly']).optional().default('none'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  mit: z.boolean().optional().default(false),
  timeSlot: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  picture: z.string().url().optional(),
  onboardingCompleted: z.boolean().optional(),
  enabledModules: z.array(z.string()).optional(),
  workStartTime: z.string().optional(),
  workEndTime: z.string().optional(),
  primaryGoal: z.string().max(300).optional(),
  // Explicitly disallow updating role directly via normal PUT /api/user endpoint
});

export const NoteSchemaValidation = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional().default(''),
  category: z.string().optional().default('Personal'),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
});

export const EventSchemaValidation = z.object({
  id: z.string().optional(),
  googleEventId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  category: z.string().optional().default('General'),
  location: z.string().optional(),
  allDay: z.boolean().optional().default(false),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
});
