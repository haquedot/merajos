import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/middleware/auth';
import { connectToDatabase } from '../../../../lib/mongodb';
import Task from '../../../../models/Task';
import Career from '../../../../models/Career';
import Research from '../../../../models/Research';
import CalendarEvent from '../../../../models/CalendarEvent';
import UserPreferences from '../../../../models/UserPreferences';
import { ProviderFactory, AIProviderId } from '../../../../lib/agent/providers/providerFactory';
import { buildAgentContext } from '../../../../lib/agent/context/agentContextBuilder';
import { OrbitAgentOrchestrator } from '../../../../lib/agent/orchestrator';
import { AgentCoPilotProposal, TaskProposal, ScheduleSlotProposal } from '../../../../lib/agent/types';
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
    const activeProvider = process.env.AI_PROVIDER || 'gemini';

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

    // Run Orchestrated Sub-Agent Tool Pipeline
    const orchestrator = new OrbitAgentOrchestrator();
    const orchestratedResult = orchestrator.runPipeline(agentContext, preferences as any);

    // Resolve AI provider using Factory
    const provider = ProviderFactory.getProvider(parsedReq.providerId as AIProviderId);

    // Formulate system prompt with context
    const systemPrompt = `You are Orbit Agent Co-Pilot, an intelligent execution assistant for Orbit (Personal Productivity OS).
Context Summary:
- Date: ${agentContext.currentContext.currentDate}
- Current Slot: ${agentContext.currentContext.currentTimeSlot}
- Overdue Tasks: ${agentContext.currentContext.overdueTaskCount}
- Pending Tasks: ${agentContext.pendingTasks.length}
- Stale DSA Topics Needing Practice: ${agentContext.staleDSATopics.map((t) => t.name).join(', ') || 'None'}
- Unread Important Research Papers: ${agentContext.unreadResearchPapers.map((p) => p.title).join(', ') || 'None'}

Goal: Help the user transform goals into 4 daily time-slots (morning, afternoon, evening, night), pick Top 3 MITs, and maintain a sustainable <7.0h workload.`;

    const StructuredSchema = z.object({
      summary: z.string(),
      taskProposals: z.array(z.object({
        title: z.string(),
        category: z.enum(['Client', 'Research', 'Career', 'Personal', 'College', 'Habit']),
        estimatedHours: z.number(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        mit: z.boolean(),
        timeSlot: z.enum(['morning', 'afternoon', 'evening', 'night']),
        reason: z.string()
      }))
    });

    const llmOutput = await provider.generateStructured(
      parsedReq.prompt,
      StructuredSchema,
      { systemPrompt }
    );

    // Merge LLM generated proposals with deterministic pipeline proposals
    const finalProposals: TaskProposal[] = llmOutput.taskProposals.length > 0
      ? (llmOutput.taskProposals as TaskProposal[])
      : orchestratedResult.taskProposals;

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

    const proposal: AgentCoPilotProposal = {
      proposalId: `prop_${Date.now()}`,
      userIntent: parsedReq.prompt,
      createdAt: new Date().toISOString(),
      providerUsed: provider.id as AIProviderId,
      taskProposals: finalProposals,
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
