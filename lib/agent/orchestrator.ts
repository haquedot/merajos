import { CareerAgent } from './subagents/careerAgent';
import { ResearchAgent } from './subagents/researchAgent';
import { TaskSlotAgent } from './subagents/taskSlotAgent';
import { ComprehensiveAgentContext } from './context/agentContextBuilder';
import { TaskProposal, ScheduleSlotProposal, AgentStep } from './types';
import { UserPreferences } from '../personalization/types';

export interface OrchestrationResult {
  taskProposals: TaskProposal[];
  scheduleSlots: ScheduleSlotProposal[];
  steps: AgentStep[];
}

export class OrbitAgentOrchestrator {
  private careerAgent: CareerAgent;
  private researchAgent: ResearchAgent;
  private taskSlotAgent: TaskSlotAgent;

  constructor() {
    this.careerAgent = new CareerAgent();
    this.researchAgent = new ResearchAgent();
    this.taskSlotAgent = new TaskSlotAgent();
  }

  public runPipeline(
    context: ComprehensiveAgentContext,
    userPreferences?: UserPreferences | null
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
      // Wrap unread papers into dummy project structure if needed
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

    // Combine raw candidate task proposals
    const rawCandidates: TaskProposal[] = [
      ...careerRes.proposals,
      ...researchRes.proposals,
      // Map pending tasks from Orbit store
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

    return {
      taskProposals: slotRes.slottedProposals,
      scheduleSlots: slotRes.scheduleSlots,
      steps
    };
  }
}
