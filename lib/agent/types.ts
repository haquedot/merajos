import { AIProviderId } from './providers/providerFactory';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type TaskCategory = 'Client' | 'Research' | 'Career' | 'Personal' | 'College' | 'Habit' | 'General';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Omni-Module Action & CRUD Types
export type ModuleType = 'tasks' | 'career' | 'research' | 'calendar' | 'notes' | 'projects' | 'habits' | 'goals' | 'clients' | 'links' | 'weekly' | 'settings';
export type CrudOp = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface ActionDiffItem {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AgentActionProposal {
  actionId: string;
  module: ModuleType;
  opType: CrudOp;
  entityId?: string;
  title: string;
  description: string;
  targetData: Record<string, unknown>;
  diffPreview?: ActionDiffItem[];
  requiresConfirmation: boolean;
  status: 'pending' | 'approved' | 'executed' | 'discarded';
}

export interface TaskProposal {
  id?: string;
  title: string;
  category: TaskCategory;
  estimatedHours: number;
  priority: TaskPriority;
  mit: boolean;
  timeSlot: TimeSlot;
  reason: string;
  targetDate?: string;
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
  summary?: string;
  isAnalysisOnly?: boolean;
  createdAt: string;
  providerUsed: AIProviderId;
  taskProposals: TaskProposal[];
  actionProposals?: AgentActionProposal[];
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
  verificationPassed: boolean;
}

export interface UserAIModelConfig {
  id: string;
  providerId: 'openai' | 'anthropic' | 'gemini' | 'groq' | 'ollama';
  name: string; // e.g. "My GPT-4o Key"
  modelName: string; // e.g. "gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro", "llama-3.3-70b-versatile"
  apiKey: string;
  baseUrl?: string;
  isActive?: boolean;
  createdAt: string;
}
