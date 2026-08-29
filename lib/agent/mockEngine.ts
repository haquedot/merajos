import { TaskProposal, AgentCoPilotProposal } from './types';
import { ComprehensiveAgentContext } from './context/agentContextBuilder';

export interface BenchmarkScenarioInput {
  scenarioId: string;
  name: string;
  description: string;
  context: ComprehensiveAgentContext;
}

export class OfflineMockEngine {
  /**
   * Generates a deterministic, verified AgentCoPilotProposal for any benchmark scenario.
   */
  public generateBenchmarkProposal(scenarioId: string, prompt: string): AgentCoPilotProposal {
    const timestamp = new Date().toISOString();

    const mockProposalsByScenario: Record<string, TaskProposal[]> = {
      'TC-01': [
        { title: 'DSA Practice: Graphs & Trees (2 Med, 1 Hard)', category: 'Career', estimatedHours: 0.75, priority: 'high', mit: true, timeSlot: 'morning', reason: 'Stale DSA topic unrevised for 12 days' },
        { title: 'Research Reading: Attention Is All You Need', category: 'Research', estimatedHours: 1.0, priority: 'high', mit: true, timeSlot: 'afternoon', reason: 'Unread paper in Literature Review section' },
        { title: 'Sprint Deliverable: Client API Authentication Bug', category: 'Client', estimatedHours: 2.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Active client project milestone' },
        { title: 'Thesis Writing: Methodology Section Draft (400w)', category: 'Research', estimatedHours: 1.5, priority: 'medium', mit: false, timeSlot: 'afternoon', reason: 'Section word count gap' },
        { title: 'Personal Routine: Gym & Mobility Work', category: 'Personal', estimatedHours: 1.0, priority: 'low', mit: false, timeSlot: 'evening', reason: 'Evening habit routine' }
      ],
      'TC-02': [
        { title: 'OA Practice: Dynamic Programming 2D Arrays', category: 'Career', estimatedHours: 1.0, priority: 'urgent', mit: true, timeSlot: 'morning', reason: 'Upcoming Online Assessment stage' },
        { title: 'System Design: Distributed Cache & Rate Limiter', category: 'Career', estimatedHours: 1.5, priority: 'high', mit: true, timeSlot: 'morning', reason: 'Interview preparation module' },
        { title: 'Paper Notes: RoBERTa & BERT Benchmark Comparison', category: 'Research', estimatedHours: 1.0, priority: 'medium', mit: true, timeSlot: 'afternoon', reason: 'Important paper queue' },
        { title: 'Review Client PR & Merge Fixes', category: 'Client', estimatedHours: 1.0, priority: 'medium', mit: false, timeSlot: 'afternoon', reason: 'Client task' }
      ]
    };

    const taskProposals = mockProposalsByScenario[scenarioId] || mockProposalsByScenario['TC-01'];
    const totalScheduledHours = taskProposals.reduce((sum, t) => sum + t.estimatedHours, 0);

    const slotsMap: Record<string, TaskProposal[]> = { morning: [], afternoon: [], evening: [], night: [] };
    taskProposals.forEach((tp) => {
      if (slotsMap[tp.timeSlot]) slotsMap[tp.timeSlot].push(tp);
      else slotsMap.morning.push(tp);
    });

    return {
      proposalId: `mock_prop_${scenarioId}_${Date.now()}`,
      userIntent: prompt,
      createdAt: timestamp,
      providerUsed: 'mock',
      taskProposals,
      scheduleSlots: [
        { slot: 'morning', label: 'Morning (6 AM - 12 PM)', tasks: slotsMap.morning, allocatedHours: slotsMap.morning.reduce((s, t) => s + t.estimatedHours, 0), availableCapacityHours: 4.0 },
        { slot: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', tasks: slotsMap.afternoon, allocatedHours: slotsMap.afternoon.reduce((s, t) => s + t.estimatedHours, 0), availableCapacityHours: 3.5 },
        { slot: 'evening', label: 'Evening (5 PM - 9 PM)', tasks: slotsMap.evening, allocatedHours: slotsMap.evening.reduce((s, t) => s + t.estimatedHours, 0), availableCapacityHours: 3.0 },
        { slot: 'night', label: 'Night (9 PM - 12:30 AM)', tasks: slotsMap.night, allocatedHours: slotsMap.night.reduce((s, t) => s + t.estimatedHours, 0), availableCapacityHours: 2.5 },
      ],
      verification: {
        isValid: true,
        totalScheduledHours,
        maxCapacityHours: 7.0,
        checks: [
          { name: 'Orbit Constraint Evaluator', passed: true, severity: 'info', message: 'Passed all local constraint rules' },
          { name: 'Workload Capacity Ceiling', passed: true, severity: 'info', message: `Total hours (${totalScheduledHours}h) <= 7.0h ceiling` },
          { name: 'Google Calendar Overlap Check', passed: true, severity: 'info', message: '0 meeting collisions' },
          { name: 'Most Important Tasks (MIT) Check', passed: true, severity: 'info', message: 'Top 3 MITs marked' }
        ]
      },
      steps: [
        { stepNumber: 1, agentName: 'OrbitOrchestrator', action: 'Initialized offline mock benchmark engine', status: 'completed', details: `Scenario: ${scenarioId}`, timestamp },
        { stepNumber: 2, agentName: 'CareerAndDSAAgent', action: 'Loaded synthetic DSA & Career dataset', status: 'completed', details: 'Extracted 2 DSA practice tasks', timestamp },
        { stepNumber: 3, agentName: 'ResearchSynthesizerAgent', action: 'Loaded synthetic paper reading queue', status: 'completed', details: 'Extracted 1 research paper candidate', timestamp },
        { stepNumber: 4, agentName: 'TaskAndSlotAgent', action: 'Slotted tasks & marked Top 3 MITs', status: 'completed', details: `Total task hours: ${totalScheduledHours}h`, timestamp },
        { stepNumber: 5, agentName: 'OrbitVerificationGuardrailAgent', action: 'Verified 0 meeting overlaps & 7.0h ceiling', status: 'completed', details: 'Verification PASSED', timestamp }
      ]
    };
  }
}
