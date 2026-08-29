import { rankAndSlotTaskProposals } from '../tools/taskSlotTools';
import { TaskProposal, ScheduleSlotProposal } from '../types';
import { UserPreferences } from '../../personalization/types';

export class TaskSlotAgent {
  name = 'TaskAndSlotAgent';

  public process(
    rawProposals: TaskProposal[],
    preferences?: UserPreferences | null
  ): {
    slottedProposals: TaskProposal[];
    scheduleSlots: ScheduleSlotProposal[];
    logMessage: string;
  } {
    const slottedProposals = rankAndSlotTaskProposals(rawProposals, preferences);

    const slotsMap: Record<string, TaskProposal[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    slottedProposals.forEach((tp) => {
      if (slotsMap[tp.timeSlot]) {
        slotsMap[tp.timeSlot].push(tp);
      } else {
        slotsMap.morning.push(tp);
      }
    });

    const scheduleSlots: ScheduleSlotProposal[] = [
      { slot: 'morning', label: 'Morning (6 AM - 12 PM)', tasks: slotsMap.morning, allocatedHours: slotsMap.morning.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 4.0 },
      { slot: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', tasks: slotsMap.afternoon, allocatedHours: slotsMap.afternoon.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.5 },
      { slot: 'evening', label: 'Evening (5 PM - 9 PM)', tasks: slotsMap.evening, allocatedHours: slotsMap.evening.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 3.0 },
      { slot: 'night', label: 'Night (9 PM - 12:30 AM)', tasks: slotsMap.night, allocatedHours: slotsMap.night.reduce((sum, t) => sum + t.estimatedHours, 0), availableCapacityHours: 2.5 },
    ];

    const mitCount = slottedProposals.filter((p) => p.mit).length;
    const logMessage = `Ranked ${slottedProposals.length} task candidates across 4 time slots. Selected ${mitCount} Most Important Tasks (MITs).`;

    return {
      slottedProposals,
      scheduleSlots,
      logMessage
    };
  }
}
