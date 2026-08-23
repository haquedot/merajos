import { BehaviorEvent, BehaviorEventType } from '../types';
import { db } from '../../../database/dexie';

export async function logBehaviorEvent(
  eventType: BehaviorEventType,
  entityId: string,
  metadata?: Record<string, any>
): Promise<BehaviorEvent | null> {
  if (typeof window === 'undefined') return null;

  try {
    const event: BehaviorEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: 'local-user',
      eventType,
      entityId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    await db.behaviorEvents.put(event);
    return event;
  } catch (err) {
    console.warn('[EventLogger] Failed to log behavior event:', err);
    return null;
  }
}
