export interface WorkloadCapacityModel {
  scheduledHours: number;
  completedHours: number;
  focusedWorkHours: number;
  calendarOccupancyHours: number;
  sustainableCapacityHours: number;
  maxOverloadThresholdHours: number;
  isOverloaded: boolean;
}

export interface CurrentContext {
  currentDate: string;
  currentTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  remainingSlotHours: number;
  overdueTaskCount: number;
  todayPendingTaskCount: number;
  activeGoalId?: string;
  activeFocusTaskId?: string;
  workload: WorkloadCapacityModel;
}
