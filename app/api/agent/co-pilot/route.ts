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
import { OrbitAgentOrchestrator, parseUserIntentPrompt, parseOmniActionProposal } from '../../../../lib/agent/orchestrator';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal, AgentActionProposal } from '../../../../lib/agent/types';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().optional().default('Analyze my workload and generate today\'s optimal schedule'),
  providerId: z.enum(['gemini', 'openai', 'anthropic', 'groq', 'ollama', 'mock']).optional()
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

    // Resolve AI provider using Factory
    const provider = ProviderFactory.getProvider(parsedReq.providerId as AIProviderId);

    // Formulate system prompt with context and user directive
    const systemPrompt = `You are Orbit Agent Co-Pilot, an intelligent execution assistant for Orbit (Personal Productivity OS).

CRITICAL DIRECTIVE:
User's Explicit Request: "${parsedReq.prompt}"

RULES:
1. You MUST generate a task that directly reflects the User's Explicit Request above (e.g. if the user asks to prepare for an interview for senior hostel, create a task titled "Prepare for Senior Hostel Interview").
2. DO NOT substitute user requests with unrelated DSA coding topics or academic papers.
3. Organize all tasks into 4 daily time-slots (morning, afternoon, evening, night), select Top 3 MITs, and maintain a sustainable <7.0h workload.

Return ONLY JSON matching this structure:
{
  "summary": "Brief summary of planned schedule",
  "taskProposals": [
    {
      "title": "Exact title matching user request",
      "category": "College",
      "estimatedHours": 1.5,
      "priority": "high",
      "mit": true,
      "timeSlot": "afternoon",
      "reason": "Direct user request"
    }
  ]
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
      summary: z.string().optional().default('Generated daily schedule proposal'),
      taskProposals: z.array(z.object({
        title: z.string().optional().default('Scheduled Action Item'),
        category: TaskCategorySchema,
        estimatedHours: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) || 1.0 : val), z.number()).default(1.0),
        priority: PrioritySchema,
        mit: z.boolean().optional().default(false),
        timeSlot: TimeSlotSchema,
        targetDate: z.string().optional(),
        reason: z.string().optional().default('AI scheduled candidate')
      })).optional().default([])
    });

    let llmProposals: TaskProposal[] = [];

    try {
      const llmOutput = await provider.generateStructured(
        parsedReq.prompt,
        StructuredSchema,
        { systemPrompt }
      );
      if (llmOutput.taskProposals && llmOutput.taskProposals.length > 0) {
        llmProposals = llmOutput.taskProposals as TaskProposal[];
      }
    } catch (err: any) {
      console.warn(`[Agent Co-Pilot API] Provider '${provider.id}' output parsing failed, falling back to deterministic sub-agents:`, err.message);
    }

    // Merge LLM generated proposals with deterministic pipeline proposals
    let finalProposals: TaskProposal[] = llmProposals.length > 0
      ? llmProposals
      : orchestratedResult.taskProposals;

    // Guaranteed Intent Enforcement: Ensure user's prompt task is present
    const userPromptTask = parseUserIntentPrompt(parsedReq.prompt);
    if (userPromptTask) {
      const matchesUserIntent = finalProposals.some((t) =>
        t.title.toLowerCase().includes('hostel') ||
        t.title.toLowerCase().includes('interview') ||
        t.title.toLowerCase().includes(userPromptTask.title.toLowerCase().substring(0, 8))
      );

      if (!matchesUserIntent) {
        // Prepend user task to ensure exact intent accuracy
        finalProposals = [userPromptTask, ...finalProposals.filter((t) => !t.mit)];
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

    const omniAction = parseOmniActionProposal(parsedReq.prompt);
    const actionProposals: AgentActionProposal[] = omniAction ? [omniAction] : [];

    const proposal: AgentCoPilotProposal = {
      proposalId: `prop_${Date.now()}`,
      userIntent: parsedReq.prompt,
      createdAt: new Date().toISOString(),
      providerUsed: provider.id as AIProviderId,
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
        { stepNumber: 1, agentName: 'OrbitOrchestrator', action: 'Ingested context & initialized provider', status: 'completed', details: `Provider: ${provider.name}`, timestamp: new Date().toISOString() },
        ...orchestratedResult.steps.map((s, idx) => ({ ...s, stepNumber: idx + 2 })),
        { stepNumber: orchestratedResult.steps.length + 2, agentName: 'VerificationAgent', action: 'Verified 4-slot layout & capacity ceiling', status: 'completed', details: `Total hours: ${totalScheduledHours}h`, timestamp: new Date().toISOString() }
      ]
    };

    return NextResponse.json({ proposal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
