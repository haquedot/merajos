import { CareerAgent } from './subagents/careerAgent';
import { ResearchAgent } from './subagents/researchAgent';
import { TaskSlotAgent } from './subagents/taskSlotAgent';
import { OrbitVerificationAgent } from './verifier';
import { ComprehensiveAgentContext } from './context/agentContextBuilder';
import { TaskProposal, ScheduleSlotProposal, AgentStep, VerificationResult } from './types';
import { UserPreferences } from '../personalization/types';

export function parseUserIntentPrompt(userPrompt: string): TaskProposal | null {
  if (!userPrompt || !userPrompt.trim()) return null;
  const cleanPrompt = userPrompt.trim();
  const lower = cleanPrompt.toLowerCase();

  if (lower.includes('analyze my workload') || lower.includes('generate schedule')) {
    return null;
  }

  // 1. Time Slot detection
  let slot: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon';
  if (lower.includes('morning')) slot = 'morning';
  else if (lower.includes('afternoon')) slot = 'afternoon';
  else if (lower.includes('evening')) slot = 'evening';
  else if (lower.includes('night')) slot = 'night';

  // 2. Category detection
  let category: TaskProposal['category'] = 'Career';
  if (lower.includes('hostel') || lower.includes('university') || lower.includes('college') || lower.includes('exam')) {
    category = 'College';
  } else if (lower.includes('research') || lower.includes('paper') || lower.includes('thesis')) {
    category = 'Research';
  } else if (lower.includes('client') || lower.includes('project') || lower.includes('freelance')) {
    category = 'Client';
  } else if (lower.includes('habit') || lower.includes('workout') || lower.includes('gym')) {
    category = 'Habit';
  } else if (lower.includes('personal') || lower.includes('buy') || lower.includes('shopping')) {
    category = 'Personal';
  }

  // 3. Robust Title Cleanup
  let title = cleanPrompt;

  // Remove command prefixes (e.g. "Create a task for tomorrow afternoon to")
  title = title.replace(/^(create|add|schedule|put|set)(\s+a)?(\s+new)?\s+task\s*/i, '');
  title = title.replace(/^(for|on|in)?\s*(today|tomorrow|this)?\s*(morning|afternoon|evening|night)?\s*/i, '');
  title = title.replace(/^(to|for|about)\s+/i, '');

  title = title.trim();
  if (!title) title = cleanPrompt;
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    id: `prompt_task_${Date.now()}`,
    title,
    category,
    estimatedHours: 1.5,
    priority: 'high',
    mit: true,
    timeSlot: slot,
    reason: `Direct user request: "${cleanPrompt}"`,
    sourceModule: 'tasks'
  };
}

export interface OrchestrationResult {
  taskProposals: TaskProposal[];
  scheduleSlots: ScheduleSlotProposal[];
  verification: VerificationResult;
  steps: AgentStep[];
}

export class OrbitAgentOrchestrator {
  private careerAgent: CareerAgent;
  private researchAgent: ResearchAgent;
  private taskSlotAgent: TaskSlotAgent;
  private verifierAgent: OrbitVerificationAgent;

  constructor() {
    this.careerAgent = new CareerAgent();
    this.researchAgent = new ResearchAgent();
    this.taskSlotAgent = new TaskSlotAgent();
    this.verifierAgent = new OrbitVerificationAgent();
  }

  public runPipeline(
    context: ComprehensiveAgentContext,
    userPreferences?: UserPreferences | null,
    userPrompt?: string
  ): OrchestrationResult {
    const steps: AgentStep[] = [];
    const timestamp = new Date().toISOString();

    // Step 1: Career Sub-Agent Pipeline
    const careerRes = this.careerAgent.process({
      dsaTopics: context.staleDSATopics,
      subjectPlans: context.pendingSubjectPlans
    });

    steps.push({
      stepNumber: 1,
      agentName: this.careerAgent.name,
      action: 'Extracted stale DSA topics and pending subject checklists',
      status: 'completed',
      details: careerRes.logMessage,
      timestamp
    });

    // Step 2: Research Sub-Agent Pipeline
    const researchRes = this.researchAgent.process(
      context.unreadResearchPapers.length > 0
        ? [{ id: 'res_proj_1', title: 'Academic Research Queue', field: 'CS', status: 'active', progress: 50, sections: [{ id: 'sec_1', type: 'Literature Review', title: 'Paper Reading', targetWords: 1000, currentWords: 400, writingStatus: 'in_progress', papers: context.unreadResearchPapers }] }]
        : []
    );

    steps.push({
      stepNumber: 2,
      agentName: this.researchAgent.name,
      action: 'Extracted unread papers and writing section gaps',
      status: 'completed',
      details: researchRes.logMessage,
      timestamp
    });

    // Extract User-Prompt Specific Task if provided
    const userPromptTask = parseUserIntentPrompt(userPrompt || '');
    const promptTasks: TaskProposal[] = userPromptTask ? [userPromptTask] : [];

    // Combine raw candidate task proposals (prompt tasks first!)
    const rawCandidates: TaskProposal[] = [
      ...promptTasks,
      ...careerRes.proposals,
      ...researchRes.proposals,
      ...context.pendingTasks.slice(0, 3).map((t) => ({
        id: t.id,
        title: t.title,
        category: (t.category as any) || 'Personal',
        estimatedHours: t.estimatedHours || 1.0,
        priority: t.priority as any || 'medium',
        mit: !!t.mit,
        timeSlot: (t.timeSlot as any) || 'evening',
        reason: 'Pending task in Orbit today queue',
        sourceModule: 'tasks' as const,
        sourceEntityId: t.id
      }))
    ];

    // Step 3: Task & Time-Slot Sub-Agent Pipeline
    const slotRes = this.taskSlotAgent.process(rawCandidates, userPreferences || context.userPreferences);

    steps.push({
      stepNumber: 3,
      agentName: this.taskSlotAgent.name,
      action: 'Scored tasks with taskScorer.ts and assigned 4 time-slots',
      status: 'completed',
      details: slotRes.logMessage,
      timestamp
    });

    // Step 4: Verification & Guardrails Sub-Agent
    const verificationRes = this.verifierAgent.verifyAndAdjust(
      slotRes.slottedProposals,
      context,
      userPreferences || context.userPreferences
    );

    steps.push({
      stepNumber: 4,
      agentName: this.verifierAgent.name,
      action: 'Evaluated constraint Evaluator and capacity ceiling',
      status: verificationRes.verification.isValid ? 'completed' : 'warning',
      details: `Scheduled ${verificationRes.verification.totalScheduledHours.toFixed(1)}h / ${verificationRes.verification.maxCapacityHours.toFixed(1)}h capacity limit. Passed ${verificationRes.verification.checks.length} guardrail checks.`,
      timestamp
    });

    return {
      taskProposals: verificationRes.verifiedProposals,
      scheduleSlots: verificationRes.scheduleSlots,
      verification: verificationRes.verification,
      steps
    };
  }
}
