import { CareerAgent } from './subagents/careerAgent';
import { ResearchAgent } from './subagents/researchAgent';
import { TaskSlotAgent } from './subagents/taskSlotAgent';
import { OrbitVerificationAgent } from './verifier';
import { ComprehensiveAgentContext } from './context/agentContextBuilder';
import { TaskProposal, ScheduleSlotProposal, AgentStep, VerificationResult, AgentActionProposal, ModuleType, CrudOp } from './types';
import { UserPreferences } from '../personalization/types';

function extractTargetTitle(prompt: string): string {
  const quoteMatch = prompt.match(/["']([^"']+)["']/);
  if (quoteMatch) return quoteMatch[1].trim();

  return prompt
    .replace(/^(delete|remove|clear|mark|update|edit|complete)\s+/i, '')
    .replace(/\s*(task|from today's task|today|from schedule|from list)\s*/gi, '')
    .trim();
}

export function parseOmniActionProposal(userPrompt: string): AgentActionProposal | null {
  if (!userPrompt || !userPrompt.trim()) return null;
  const clean = userPrompt.trim();
  const lower = clean.toLowerCase();

  // Ignore general workload analysis commands
  if (lower.includes('analyze my workload') || lower.includes('generate schedule')) {
    return null;
  }

  // Detect CRUD operation
  let opType: CrudOp = 'CREATE';
  if (lower.startsWith('delete') || lower.startsWith('remove') || lower.includes('delete task') || lower.includes('remove note')) {
    opType = 'DELETE';
  } else if (lower.startsWith('update') || lower.startsWith('mark') || lower.startsWith('edit') || lower.startsWith('check') || lower.includes('revised') || lower.includes('solved')) {
    opType = 'UPDATE';
  } else if (lower.startsWith('find') || lower.startsWith('get') || lower.startsWith('show') || lower.startsWith('list') || lower.startsWith('search')) {
    opType = 'READ';
  }

  // Detect Module
  let module: ModuleType = 'tasks';
  if (lower.includes('note') || lower.includes('memo') || lower.includes('checklist')) {
    module = 'notes';
  } else if (lower.includes('dsa') || lower.includes('topic') || lower.includes('syllabus') || lower.includes('subject') || lower.includes('revised')) {
    module = 'career';
  } else if (lower.includes('paper') || lower.includes('citation') || lower.includes('abstract') || lower.includes('journal') || lower.includes('research')) {
    module = 'research';
  } else if (lower.includes('project') || lower.includes('milestone')) {
    module = 'projects';
  } else if (lower.includes('habit') || lower.includes('routine') || lower.includes('streak')) {
    module = 'habits';
  } else if (lower.includes('goal') || lower.includes('okr') || lower.includes('key result')) {
    module = 'goals';
  } else if (lower.includes('event') || lower.includes('meeting') || lower.includes('calendar') || lower.includes('reschedule')) {
    module = 'calendar';
  }

  const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const extractedTitle = extractTargetTitle(clean);

  if (module === 'notes') {
    const titleMatch = clean.replace(/^(create|add|new)\s+(a\s+)?(note|memo)\s*(titled|named|called)?\s*/i, '').trim();
    return {
      actionId,
      module: 'notes',
      opType,
      title: opType === 'DELETE' ? `Delete Note: "${extractedTitle}"` : `Note: "${extractedTitle}"`,
      description: `${opType} note action parsed from prompt`,
      targetData: { title: extractedTitle || titleMatch || clean, content: '', tags: ['co-pilot'] },
      requiresConfirmation: opType === 'DELETE',
      status: 'pending'
    };
  }

  if (module === 'career') {
    return {
      actionId,
      module: 'career',
      opType: 'UPDATE',
      title: `Career/DSA Action: ${clean}`,
      description: `Update revision status/progress for DSA or Subject Syllabus`,
      targetData: { title: extractedTitle, prompt: clean, markRevised: true },
      diffPreview: [{ field: 'revisionStatus', before: 'Stale (>7d)', after: 'Revised (Today)' }],
      requiresConfirmation: false,
      status: 'pending'
    };
  }

  if (module === 'research') {
    return {
      actionId,
      module: 'research',
      opType,
      title: `Research Engine: ${clean}`,
      description: `${opType} research paper citation or section word count`,
      targetData: { title: extractedTitle, prompt: clean },
      requiresConfirmation: opType === 'DELETE',
      status: 'pending'
    };
  }

  return {
    actionId,
    module,
    opType,
    title: opType === 'DELETE' ? `Delete Task: "${extractedTitle}"` : `${opType} ${module.toUpperCase()}: "${extractedTitle}"`,
    description: opType === 'DELETE' ? `Delete task matching "${extractedTitle}"` : `Parsed action proposal for ${module} module`,
    targetData: { title: extractedTitle, prompt: clean },
    diffPreview: opType === 'DELETE' ? [{ field: 'Status', before: 'Active', after: 'Deleted' }] : undefined,
    requiresConfirmation: opType === 'DELETE',
    status: 'pending'
  };
}

export function parseUserIntentPrompt(userPrompt: string): TaskProposal | null {
  if (!userPrompt || !userPrompt.trim()) return null;
  const cleanPrompt = userPrompt.trim();
  const lower = cleanPrompt.toLowerCase();

  if (
    lower.includes('analyze my workload') ||
    lower.includes('generate schedule') ||
    lower.startsWith('delete') ||
    lower.startsWith('remove') ||
    lower.startsWith('clear') ||
    lower.startsWith('mark') ||
    lower.startsWith('update') ||
    lower.startsWith('edit') ||
    lower.startsWith('complete') ||
    lower.includes('delete task') ||
    lower.includes('remove task')
  ) {
    return null;
  }

  // 1. Time Slot detection
  let slot: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon';
  if (lower.includes('morning')) slot = 'morning';
  else if (lower.includes('afternoon')) slot = 'afternoon';
  else if (lower.includes('evening')) slot = 'evening';
  else if (lower.includes('night')) slot = 'night';

  // 2. Category detection (Defaults to General unless specific module keyword detected)
  let category: TaskProposal['category'] = 'General';
  if (lower.includes('university') || lower.includes('college') || lower.includes('exam')) {
    category = 'College';
  } else if (lower.includes('research') || lower.includes('paper') || lower.includes('thesis')) {
    category = 'Research';
  } else if (lower.includes('career') || lower.includes('dsa') || lower.includes('job') || lower.includes('resume')) {
    category = 'Career';
  } else if (lower.includes('client') || lower.includes('freelance')) {
    category = 'Client';
  } else if (lower.includes('habit') || lower.includes('workout') || lower.includes('gym')) {
    category = 'Habit';
  } else if (lower.includes('personal') || lower.includes('buy') || lower.includes('shopping')) {
    category = 'Personal';
  }

  // 3. Date detection (Today vs Tomorrow vs Specific)
  const todayObj = new Date();
  let targetDate = todayObj.toISOString().split('T')[0];
  if (lower.includes('tomorrow')) {
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    targetDate = tomorrowObj.toISOString().split('T')[0];
  }

  // 4. Robust Title Cleanup
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
    targetDate,
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
        ? [{ id: 'res_proj_1', title: 'Academic Research Queue', field: 'CS', status: 'active', progress: 50, createdAt: timestamp, updatedAt: timestamp, sections: [{ id: 'sec_1', type: 'literature_review', title: 'Paper Reading', targetWords: 1000, currentWords: 400, writingStatus: 'drafting', createdAt: timestamp, order: 1, papers: context.unreadResearchPapers }] }]
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
