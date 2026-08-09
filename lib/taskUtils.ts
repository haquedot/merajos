import { Task, TimeSlot } from '../types';

export function parseTimeAndSlotFromText(
  text?: string,
  dueStr?: string
): { time?: string; timeSlot: TimeSlot } {
  let extractedTime: string | undefined = undefined;

  // 1. Check dueStr for ISO time component (e.g. 2026-08-09T14:30:00.000Z)
  if (dueStr && dueStr.includes('T')) {
    const timePart = dueStr.split('T')[1]?.substring(0, 5);
    if (timePart && timePart !== '00:00') {
      extractedTime = timePart;
    }
  }

  // 2. If no time from dueStr, check text (title or description) via regex
  if (!extractedTime && text) {
    // Regex for matching "8:00 PM", "04:30 PM", "12:30 PM", "4:45 AM", "20:00"
    const time12Regex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match12 = text.match(time12Regex);

    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const meridiem = match12[3].toUpperCase();

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      extractedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      // Check 24-hour pattern e.g. "20:00"
      const time24Regex = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
      const match24 = text.match(time24Regex);
      if (match24) {
        extractedTime = `${String(match24[1]).padStart(2, '0')}:${String(match24[2]).padStart(2, '0')}`;
      }
    }
  }

  // 3. Determine timeSlot from extractedTime
  let timeSlot: TimeSlot = 'afternoon';
  if (extractedTime) {
    const hour = parseInt(extractedTime.split(':')[0], 10);
    if (hour >= 4 && hour < 12) {
      timeSlot = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeSlot = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeSlot = 'evening';
    } else {
      timeSlot = 'night';
    }
  }

  return { time: extractedTime, timeSlot };
}

export function sortTasksChronologically(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const parsedA = parseTimeAndSlotFromText(`${a.title} ${a.description || ''}`);
    const parsedB = parseTimeAndSlotFromText(`${b.title} ${b.description || ''}`);

    const timeA = a.time || parsedA.time;
    const timeB = b.time || parsedB.time;

    if (timeA && timeB) {
      return timeA.localeCompare(timeB);
    }
    if (timeA) return -1;
    if (timeB) return 1;

    // Slot order
    const slotOrder: Record<string, number> = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    const slotA = slotOrder[a.timeSlot || parsedA.timeSlot] || 2;
    const slotB = slotOrder[b.timeSlot || parsedB.timeSlot] || 2;
    if (slotA !== slotB) return slotA - slotB;

    // Priority
    const priorityOrder: Record<string, number> = { urgent: 1, high: 2, medium: 3, low: 4 };
    const prioA = priorityOrder[a.priority] || 3;
    const prioB = priorityOrder[b.priority] || 3;
    return prioA - prioB;
  });
}

export function getSmartFocusTask(tasks: Task[]): Task | null {
  const sorted = sortTasksChronologically(tasks);
  const uncompleted = sorted.filter((t) => t.status !== 'completed');
  if (uncompleted.length === 0) return null;

  // 1. If an uncompleted task is marked as MIT, pick the earliest MIT
  const mitTask = uncompleted.find((t) => t.mit);
  if (mitTask) return mitTask;

  // 2. Current time slot
  const now = new Date();
  const currentHour = now.getHours();

  let currentSlot: TimeSlot = 'afternoon';
  if (currentHour >= 4 && currentHour < 12) currentSlot = 'morning';
  else if (currentHour >= 12 && currentHour < 17) currentSlot = 'afternoon';
  else if (currentHour >= 17 && currentHour < 21) currentSlot = 'evening';
  else currentSlot = 'night';

  // 3. Find uncompleted task in current slot
  const currentSlotTask = uncompleted.find((t) => {
    const parsed = parseTimeAndSlotFromText(`${t.title} ${t.description || ''}`);
    const slot = t.timeSlot || parsed.timeSlot;
    return slot === currentSlot;
  });

  if (currentSlotTask) return currentSlotTask;

  // 4. Fallback to earliest uncompleted task overall
  return uncompleted[0];
}
