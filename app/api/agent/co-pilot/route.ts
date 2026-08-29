import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/middleware/auth';
import { connectToDatabase } from '../../../../lib/mongodb';
import Task from '../../../../models/Task';
import Career from '../../../../models/Career';
import Research from '../../../../models/Research';
import CalendarEvent from '../../../../models/CalendarEvent';
import UserPreferences from '../../../../models/UserPreferences';
import { ProviderFactory, AIProviderId, DEFAULT_AI_PROVIDER } from '../../../../lib/agent/providers/providerFactory';
import { buildAgentContext } from '../../../../lib/agent/context/agentContextBuilder';
import { OrbitAgentOrchestrator, parseUserIntentPrompt, parseOmniActionProposal, isAnalysisQuery } from '../../../../lib/agent/orchestrator';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal, AgentActionProposal } from '../../../../lib/agent/types';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().optional().default('Analyze my workload and generate today\'s optimal schedule'),
  providerId: z.enum(['gemini', 'gemini-nano', 'openai', 'anthropic', 'groq', 'ollama', 'mock']).optional()
});

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    const availableProviders = ProviderFactory.getAvailableProviders();
    const activeProvider = process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER;

    return NextResponse.json({
      activeProvider,
      mockMode: process.env.AGENT_MOCK_MODE === 'true',
      availableProviders
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const body = await req.json().catch(() => ({}));
    const parsedReq = RequestSchema.parse(body);

    const userFilter = { $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] };

    // Load live Orbit context across all modules
    const tasks = await Task.find(userFilter).lean();
    const careerDoc = await Career.findOne(userFilter).lean();
    const researchDoc = await Research.findOne(userFilter).lean();
    const events = await CalendarEvent.find(userFilter).lean();
    const preferences = await UserPreferences.findOne(userFilter).lean();

    const agentContext = buildAgentContext({
      tasks: tasks as any,
      events: events as any,
      preferences: preferences as any,
      dsaTopics: (careerDoc?.dsaTopics || []) as any,
      subjectPlans: (careerDoc?.subjectPlans || []) as any,
      researchPapers: (researchDoc?.projects?.flatMap((p: any) => p.sections?.flatMap((s: any) => s.papers || [])) || []) as any
    });

    // Run Orchestrated Sub-Agent Tool Pipeline with User Prompt Context
    const orchestrator = new OrbitAgentOrchestrator();
    const orchestratedResult = orchestrator.runPipeline(agentContext, preferences as any, parsedReq.prompt);

    // Resolve AI provider using Factory (If gemini-nano is sent to server endpoint, fallback to default local Ollama for server processing)
    const effectiveProviderId = parsedReq.providerId === 'gemini-nano' ? DEFAULT_AI_PROVIDER : (parsedReq.providerId as AIProviderId);
    const provider = ProviderFactory.getProvider(effectiveProviderId);

    // Formulate system prompt with context and user directive for LLM semantic reasoning
    const systemPrompt = `You are Omini, the intelligent personal AI assistant for Orbit OS.
User's Explicit Directive: "${parsedReq.prompt}"

Classify the user's directive into one of 3 semantic intent types:
1. "INFORMATIONAL_QUERY": Questions, analysis, or recommendations (e.g. "What should I do tomorrow", "Analyze todays tasks", "How is my day").
   - DO NOT create fake tasks matching the prompt text.
   - Provide a helpful, concise answer in "summary" analyzing the user's workload and context.
2. "TASK_MUTATION": Direct request to create or schedule a specific task (e.g. "Create a task for tomorrow afternoon to play badminton").
   - Fill "explicitTask" with the title, category, timeSlot, and targetDate requested.
3. "MODULE_ACTION": Direct request to create, update, or delete workspace items (e.g. "Delete Accenture assessment task", "Create note titled Meeting Notes").
   - Fill "actionProposals" array with the requested CRUD operation details.

Return ONLY valid JSON matching this structure:
{
  "intentType": "INFORMATIONAL_QUERY",
  "summary": "Clear response or summary answering the prompt",
  "actionProposals": [],
  "explicitTask": null
}`;

    const TaskCategorySchema = z.preprocess((val) => {
      if (typeof val === 'string') {
        const norm = val.trim().toLowerCase();
        if (norm.includes('client') || norm.includes('freelance')) return 'Client';
        if (norm.includes('research') || norm.includes('paper')) return 'Research';
        if (norm.includes('career') || norm.includes('dsa') || norm.includes('job') || norm.includes('interview')) return 'Career';
        if (norm.includes('personal') || norm.includes('life')) return 'Personal';
        if (norm.includes('college') || norm.includes('university') || norm.includes('hostel') || norm.includes('exam')) return 'College';
        if (norm.includes('habit') || norm.includes('gym')) return 'Habit';
        return 'General';
      }
      return 'General';
    }, z.enum(['Client', 'Research', 'Career', 'Personal', 'College', 'Habit', 'General'])).default('General');

    const TimeSlotSchema = z.preprocess((val) => {
      if (typeof val === 'string') {
        const norm = val.trim().toLowerCase();
        if (norm.includes('morning')) return 'morning';
        if (norm.includes('afternoon')) return 'afternoon';
        if (norm.includes('evening')) return 'evening';
        if (norm.includes('night')) return 'night';
      }
      return 'afternoon';
    }, z.enum(['morning', 'afternoon', 'evening', 'night'])).default('afternoon');

    const PrioritySchema = z.preprocess((val) => {
      if (typeof val === 'string') {
        const norm = val.trim().toLowerCase();
        if (norm.includes('low')) return 'low';
        if (norm.includes('urgent')) return 'urgent';
        if (norm.includes('high')) return 'high';
      }
      return 'medium';
    }, z.enum(['low', 'medium', 'high', 'urgent'])).default('medium');

    const StructuredSchema = z.object({
      intentType: z.enum(['INFORMATIONAL_QUERY', 'TASK_MUTATION', 'MODULE_ACTION']).default('INFORMATIONAL_QUERY'),
      summary: z.string().optional().default(''),
      actionProposals: z.array(z.object({
        module: z.enum(['tasks', 'career', 'research', 'calendar', 'notes', 'projects', 'habits', 'goals']).default('tasks'),
        opType: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE']).default('CREATE'),
        title: z.string(),
        description: z.string().optional().default('Parsed action proposal'),
        targetData: z.record(z.string(), z.unknown()).optional().default({})
      })).optional().default([]),
      explicitTask: z.object({
        title: z.string(),
        category: TaskCategorySchema,
        estimatedHours: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) || 1.0 : val), z.number()).default(1.0),
        priority: PrioritySchema,
        mit: z.boolean().optional().default(true),
        timeSlot: TimeSlotSchema,
        targetDate: z.string().optional(),
        reason: z.string().optional().default('User requested task')
      }).optional().nullable().default(null)
    });

    let llmSummary = '';
    let llmIntent: 'INFORMATIONAL_QUERY' | 'TASK_MUTATION' | 'MODULE_ACTION' = 'INFORMATIONAL_QUERY';
    let llmActionProposals: AgentActionProposal[] = [];
    let llmExplicitTask: TaskProposal | null = null;

    try {
      const llmOutput = await provider.generateStructured(
        parsedReq.prompt,
        StructuredSchema,
        { systemPrompt }
      );

      if (llmOutput) {
        llmIntent = llmOutput.intentType;
        llmSummary = llmOutput.summary || '';
        if (llmOutput.actionProposals && llmOutput.actionProposals.length > 0) {
          llmActionProposals = llmOutput.actionProposals.map((a, i) => ({
            actionId: `act_${Date.now()}_${i}`,
            module: a.module as any,
            opType: a.opType as any,
            title: a.title,
            description: a.description || `Parsed ${a.opType} operation for ${a.module}`,
            targetData: a.targetData || { prompt: parsedReq.prompt },
            requiresConfirmation: a.opType === 'DELETE',
            status: 'pending'
          }));
        }
        if (llmOutput.explicitTask && llmOutput.explicitTask.title) {
          llmExplicitTask = {
            id: `prompt_task_${Date.now()}`,
            title: llmOutput.explicitTask.title,
            category: llmOutput.explicitTask.category as any,
            estimatedHours: llmOutput.explicitTask.estimatedHours,
            priority: llmOutput.explicitTask.priority as any,
            mit: llmOutput.explicitTask.mit ?? true,
            timeSlot: llmOutput.explicitTask.timeSlot as any,
            targetDate: llmOutput.explicitTask.targetDate,
            reason: `Direct user request: "${parsedReq.prompt}"`,
            sourceModule: 'tasks'
          };
        }
      }
    } catch (err: any) {
      console.warn(`[Agent Co-Pilot API] Provider '${provider.id}' semantic evaluation fallback:`, err.message);
    }

    // Fallback to deterministic orchestrator if LLM didn't specify explicit task
    let finalProposals: TaskProposal[] = orchestratedResult.taskProposals;

    const isAnalysisOnly = llmIntent === 'INFORMATIONAL_QUERY' || isAnalysisQuery(parsedReq.prompt);

    // If LLM or prompt extraction identified an explicit task, insert it ONLY if not an analysis/informational query
    const fallbackUserTask = parseUserIntentPrompt(parsedReq.prompt);
    const taskToAdd = !isAnalysisOnly && (llmExplicitTask || (llmIntent === 'TASK_MUTATION' ? fallbackUserTask : null));

    if (taskToAdd) {
      const matchesUserIntent = finalProposals.some((t) =>
        t.title.toLowerCase().includes(taskToAdd.title.toLowerCase().substring(0, 8))
      );
      if (!matchesUserIntent) {
        finalProposals = [taskToAdd, ...finalProposals.filter((t) => !t.mit)];
      }
    }

    // Group tasks into 4 Time Slots
    const slots: Record<string, TaskProposal[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    finalProposals.forEach((tp) => {
      const slotKey = tp.timeSlot || 'morning';
      if (slots[slotKey]) {
        slots[slotKey].push(tp);
      } else {
        slots.morning.push(tp);
      }
    });

    const scheduleSlots: ScheduleSlotProposal[] = [
      { slot: 'morning', label: 'Morning (6 AM - 12 PM)', tasks: slots.morning, allocatedHours: slots.morning.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 4.0 },
      { slot: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', tasks: slots.afternoon, allocatedHours: slots.afternoon.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.5 },
      { slot: 'evening', label: 'Evening (5 PM - 9 PM)', tasks: slots.evening, allocatedHours: slots.evening.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.0 },
      { slot: 'night', label: 'Night (9 PM - 12:30 AM)', tasks: slots.night, allocatedHours: slots.night.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 2.5 },
    ];

    const totalScheduledHours = finalProposals.reduce((sum, t) => sum + t.estimatedHours, 0);

    // Dynamic Action Proposals: strictly empty if informational query
    const omniAction = parseOmniActionProposal(parsedReq.prompt);
    const actionProposals: AgentActionProposal[] = isAnalysisOnly
      ? []
      : llmActionProposals.length > 0
      ? llmActionProposals
      : omniAction
      ? [omniAction]
      : [];

    const usedProviderId = parsedReq.providerId || provider.id;
    const usedProviderName = parsedReq.providerId === 'gemini-nano' ? 'Gemini Nano (Chrome Built-in On-Device)' : provider.name;

    const isTomorrowQuery = parsedReq.prompt.toLowerCase().includes('tomorrow');
    const summaryText = llmSummary.trim() || (isTomorrowQuery
      ? `Tomorrow's Recommendation: ${finalProposals.length} tasks totaling ${totalScheduledHours}h recommended based on your workspace context.`
      : `Workload Overview: ${finalProposals.length} tasks scheduled totaling ${totalScheduledHours}h out of 7.0h max capacity limit.`);

    const proposal: AgentCoPilotProposal = {
      proposalId: `prop_${Date.now()}`,
      userIntent: parsedReq.prompt,
      summary: summaryText,
      isAnalysisOnly,
      createdAt: new Date().toISOString(),
      providerUsed: usedProviderId as AIProviderId,
      taskProposals: finalProposals,
      actionProposals,
      scheduleSlots,
      verification: {
        isValid: totalScheduledHours <= 7.0,
        totalScheduledHours,
        maxCapacityHours: 7.0,
        checks: [
          { name: 'Capacity Ceiling', passed: totalScheduledHours <= 7.0, severity: 'error', message: totalScheduledHours <= 7.0 ? 'Workload within sustainable 7.0h limit' : 'Exceeds 7.0h limit' },
          { name: 'MIT Count', passed: finalProposals.filter((t) => t.mit).length === 3, severity: 'warning', message: 'Top 3 MITs marked' }
        ]
      },
      steps: [
        { stepNumber: 1, agentName: 'OrbitOrchestrator', action: 'Ingested context & initialized provider', status: 'completed', details: `Provider: ${usedProviderName}`, timestamp: new Date().toISOString() },
        ...orchestratedResult.steps.map((s, idx) => ({ ...s, stepNumber: idx + 2 })),
        { stepNumber: orchestratedResult.steps.length + 2, agentName: 'VerificationAgent', action: 'Verified 4-slot layout & capacity ceiling', status: 'completed', details: `Total hours: ${totalScheduledHours}h`, timestamp: new Date().toISOString() }
      ]
    };

    return NextResponse.json({ proposal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
