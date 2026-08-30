import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/middleware/auth';
import { connectToDatabase } from '../../../../lib/mongodb';
import Task from '../../../../models/Task';
import Career from '../../../../models/Career';
import Research from '../../../../models/Research';
import CalendarEvent from '../../../../models/CalendarEvent';
import UserPreferences from '../../../../models/UserPreferences';
import { ProviderFactory, AIProviderId, DEFAULT_AI_PROVIDER } from '../../../../lib/agent/providers/providerFactory';
import { buildAgentContext, detectRequiredModules, formatCompactWorkspaceIndex } from '../../../../lib/agent/context/agentContextBuilder';
import { OrbitAgentOrchestrator, parseUserIntentPrompt, parseOmniActionProposal, isAnalysisQuery, isExternalKnowledgeQuery } from '../../../../lib/agent/orchestrator';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal, AgentActionProposal } from '../../../../lib/agent/types';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().optional().default('Analyze my workload and generate today\'s optimal schedule'),
  providerId: z.enum(['gemini', 'gemini-nano', 'openai', 'anthropic', 'groq', 'ollama', 'mock']).optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([]),
  userConfig: z.object({
    providerId: z.enum(['gemini', 'gemini-nano', 'openai', 'anthropic', 'groq', 'ollama', 'mock']).optional(),
    modelName: z.string().optional(),
    apiKey: z.string().optional(),
    baseUrl: z.string().optional(),
  }).optional()
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

    // Resolve AI provider using Factory with optional custom BYOK credentials
    const effectiveProviderId = parsedReq.userConfig?.providerId || (parsedReq.providerId === 'gemini-nano' ? DEFAULT_AI_PROVIDER : (parsedReq.providerId as AIProviderId));
    const provider = ProviderFactory.getProvider(effectiveProviderId, parsedReq.userConfig);

    // ZERO-TOKEN FAST PATH: If query is general external knowledge (e.g. "Who is prime minister of India?"), skip DB ingestion & tool pipeline
    if (isExternalKnowledgeQuery(parsedReq.prompt)) {
      let fastAnswer = '';
      try {
        const textResult = await provider.generateText(
          `Answer the user's question clearly, accurately, and concisely in 2-4 sentences:\nUser Question: "${parsedReq.prompt}"`
        );
        fastAnswer = textResult || '';
      } catch (err: any) {
        fastAnswer = `I received your query: "${parsedReq.prompt}". Please verify your active AI provider setup.`;
      }

      const fastProposal: AgentCoPilotProposal = {
        proposalId: `prop_fast_${Date.now()}`,
        userIntent: parsedReq.prompt,
        summary: fastAnswer || `Direct response for: "${parsedReq.prompt}"`,
        isAnalysisOnly: true,
        createdAt: new Date().toISOString(),
        providerUsed: effectiveProviderId,
        taskProposals: [],
        actionProposals: [],
        scheduleSlots: [],
        verification: {
          isValid: true,
          totalScheduledHours: 0,
          maxCapacityHours: 7.0,
          checks: [{ name: 'Zero-Token Fast Path', passed: true, severity: 'info', message: 'Bypassed DB & pipeline for external knowledge query' }]
        },
        steps: [
          { stepNumber: 1, agentName: 'ZeroTokenFastPath', action: 'Answered external Q&A directly with zero DB overhead', status: 'completed', details: `Provider: ${provider.name}`, timestamp: new Date().toISOString() }
        ]
      };

      return NextResponse.json({ proposal: fastProposal });
    }

    const userFilter = { $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] };
    const requiredModules = detectRequiredModules(parsedReq.prompt);

    // Selective DB Ingestion: Fetch minimal fields only for requested modules
    const tasks = requiredModules.tasks
      ? await Task.find(userFilter).select('id title category priority status timeSlot estimatedHours mit').limit(12).lean()
      : [];
    const careerDoc = requiredModules.career ? await Career.findOne(userFilter).lean() : null;
    const researchDoc = requiredModules.research ? await Research.findOne(userFilter).lean() : null;
    const events = requiredModules.calendar ? await CalendarEvent.find(userFilter).select('title startTime endTime').limit(5).lean() : [];
    const preferences = await UserPreferences.findOne(userFilter).lean();

    const compactWorkspaceIndex = formatCompactWorkspaceIndex({
      tasks: tasks as any[]
    });

    const agentContext = buildAgentContext({
      tasks: tasks as any,
      events: events as any,
      preferences: preferences as any,
      dsaTopics: (careerDoc?.dsaTopics || []) as any,
      subjectPlans: (careerDoc?.subjectPlans || []) as any,
      researchPapers: (researchDoc?.projects?.flatMap((p: any) => p.sections?.flatMap((s: any) => s.papers || [])) || []) as any
    });
    agentContext.compactWorkspaceIndex = compactWorkspaceIndex;

    // Run Orchestrated Sub-Agent Tool Pipeline with User Prompt Context
    const orchestrator = new OrbitAgentOrchestrator();
    const orchestratedResult = orchestrator.runPipeline(agentContext, preferences as any, parsedReq.prompt);

    const historyBlock = parsedReq.chatHistory.length > 0
      ? `=== CONVERSATION HISTORY (Last ${parsedReq.chatHistory.length} Turns) ===\n` +
        parsedReq.chatHistory.map((h) => `${h.role === 'user' ? 'User' : 'Omini Assistant'}: ${h.content}`).join('\n') + '\n\n'
      : '';

    // Formulate system prompt with context and user directive for LLM semantic reasoning
    const systemPrompt = `You are Omini, the intelligent personal AI assistant for Orbit OS.
${compactWorkspaceIndex}

${historyBlock}User's Explicit Directive: "${parsedReq.prompt}"

Classify the user's directive into one of 3 semantic intent types:
1. "INFORMATIONAL_QUERY": Questions, analysis, or recommendations (e.g. "What should I do tomorrow", "Analyze todays tasks", "Who is prime minister of India").
   - DO NOT create fake tasks or fake action proposals.
   - Provide a direct, clear answer in "summary".
2. "TASK_MUTATION": Direct request to create or schedule a specific task (e.g. "Create a task for tomorrow afternoon to play badminton").
   - Fill "explicitTask" with the title, category, timeSlot, and targetDate requested.
3. "MODULE_ACTION": Direct request to create, update, or delete items in Orbit OS modules:
   - "projects" or "clients": Projects & Clients (e.g. "Create a new project Orbit", "Create client Acme", "Delete project X"). Note: Projects and Clients are the same module in Orbit OS.
   - "notes": Notes & Knowledge Items (e.g. "Create note titled Meeting Notes").
   - "career": DSA Topics & Subject Syllabus (e.g. "Mark DP topic revised").
   - "research": Research Papers & Literature Reviews (e.g. "Add paper on Transformers").
   - "habits": Habits & Routines.
   - "goals": Goals & OKRs.
   - "calendar": Calendar Events & Meetings.
   - Fill "actionProposals" array with module, opType (CREATE/READ/UPDATE/DELETE), title, and targetData.

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

    const TargetDataSchema = z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        } catch {
          return { title: val, name: val, prompt: val };
        }
      }
      if (typeof val === 'object' && val !== null) return val;
      return {};
    }, z.record(z.string(), z.unknown())).optional().default({});

    const StructuredSchema = z.object({
      intentType: z.enum(['INFORMATIONAL_QUERY', 'TASK_MUTATION', 'MODULE_ACTION']).default('INFORMATIONAL_QUERY'),
      summary: z.string().optional().default(''),
      actionProposals: z.array(z.object({
        module: z.enum(['tasks', 'career', 'research', 'calendar', 'notes', 'projects', 'habits', 'goals', 'clients']).default('tasks'),
        opType: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE']).default('CREATE'),
        title: z.string().optional().default('Workspace Action Proposal'),
        description: z.string().optional().default('Parsed action proposal'),
        targetData: TargetDataSchema
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

    // Resolve Omni Module Action Proposal if present
    const omniAction = parseOmniActionProposal(parsedReq.prompt);
    const hasModuleAction = llmIntent === 'MODULE_ACTION' || llmActionProposals.length > 0 || !!omniAction;
    const isAnalysisOnly = !hasModuleAction && (llmIntent === 'INFORMATIONAL_QUERY' || isAnalysisQuery(parsedReq.prompt));

    const actionProposals: AgentActionProposal[] = isAnalysisOnly
      ? []
      : llmActionProposals.length > 0
      ? llmActionProposals
      : omniAction
      ? [omniAction]
      : [];

    // Fallback to deterministic orchestrator if LLM didn't specify explicit task
    let finalProposals: TaskProposal[] = isAnalysisOnly ? [] : orchestratedResult.taskProposals;

    // If LLM or prompt extraction identified an explicit task, insert it ONLY if not an analysis or module action query
    const fallbackUserTask = parseUserIntentPrompt(parsedReq.prompt);
    const taskToAdd = !isAnalysisOnly && !hasModuleAction && (llmExplicitTask || (llmIntent === 'TASK_MUTATION' ? fallbackUserTask : null));

    if (taskToAdd) {
      const matchesUserIntent = finalProposals.some((t) =>
        t.title.toLowerCase().includes(taskToAdd.title.toLowerCase().substring(0, 8))
      );
      if (!matchesUserIntent) {
        finalProposals = [taskToAdd, ...finalProposals.filter((t) => !t.mit)];
      }
    }

    // Group tasks into 4 Time Slots (only if not an analysis/informational query)
    const slots: Record<string, TaskProposal[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    if (!isAnalysisOnly && finalProposals.length > 0) {
      finalProposals.forEach((tp) => {
        const slotKey = tp.timeSlot || 'morning';
        if (slots[slotKey]) {
          slots[slotKey].push(tp);
        } else {
          slots.morning.push(tp);
        }
      });
    }

    const scheduleSlots: ScheduleSlotProposal[] = isAnalysisOnly || finalProposals.length === 0
      ? []
      : [
          { slot: 'morning', label: 'Morning (6 AM - 12 PM)', tasks: slots.morning, allocatedHours: slots.morning.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 4.0 },
          { slot: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', tasks: slots.afternoon, allocatedHours: slots.afternoon.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.5 },
          { slot: 'evening', label: 'Evening (5 PM - 9 PM)', tasks: slots.evening, allocatedHours: slots.evening.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.0 },
          { slot: 'night', label: 'Night (9 PM - 12:30 AM)', tasks: slots.night, allocatedHours: slots.night.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 2.5 },
        ];

    const totalScheduledHours = finalProposals.reduce((sum, t) => sum + t.estimatedHours, 0);

    const usedProviderId = parsedReq.providerId || provider.id;
    const usedProviderName = parsedReq.providerId === 'gemini-nano' ? 'Gemini Nano (Chrome Built-in On-Device)' : provider.name;

    const isTomorrowQuery = parsedReq.prompt.toLowerCase().includes('tomorrow');
    const summaryText = llmSummary.trim() || (actionProposals.length > 0
      ? `Parsed ${actionProposals.length} workspace module operation request for "${actionProposals[0].title}". Review the action proposal card below to execute.`
      : isTomorrowQuery
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
