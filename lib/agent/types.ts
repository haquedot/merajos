import { AIProviderId } from './providers/providerFactory';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type TaskCategory = 'Client' | 'Research' | 'Career' | 'Personal' | 'College' | 'Habit';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskProposal {
  id?: string;
  title: string;
  category: TaskCategory;
  estimatedHours: number;
  priority: TaskPriority;
  mit: boolean;
  timeSlot: TimeSlot;
  reason: string;
  sourceModule?: 'career' | 'research' | 'project' | 'tasks';
  sourceEntityId?: string;
}

export interface ScheduleSlotProposal {
  slot: TimeSlot;
  label: string; // e.g. "Morning (6 AM - 12 PM)"
  tasks: TaskProposal[];
  allocatedHours: number;
  availableCapacityHours: number;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface VerificationResult {
  isValid: boolean;
  totalScheduledHours: number;
  maxCapacityHours: number;
  checks: VerificationCheck[];
}

export interface AgentStep {
  stepNumber: number;
  agentName: string;
  action: string;
  status: 'running' | 'completed' | 'warning' | 'failed';
  details: string;
  timestamp: string;
  toolCall?: {
    toolName: string;
    params: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
}

export interface AgentCoPilotProposal {
  proposalId: string;
  userIntent: string;
  createdAt: string;
  providerUsed: AIProviderId;
  taskProposals: TaskProposal[];
  scheduleSlots: ScheduleSlotProposal[];
  verification: VerificationResult;
  steps: AgentStep[];
}

export interface AgentTrajectory {
  id: string;
  scenarioName: string;
  provider: AIProviderId;
  timestamp: string;
  durationMs: number;
  inputPrompt: string;
  proposal: AgentCoPilotProposal;
}
