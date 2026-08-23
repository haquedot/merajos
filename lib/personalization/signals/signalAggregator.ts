import { DerivedSignal, BehaviorEvent } from '../types';
import { db } from '../../../database/dexie';

const MIN_SAMPLE_SIZE = 10;
const HALF_LIFE_DAYS = 30;

/**
 * Calculates exponential recency weight based on observation age.
 * W(t) = e^(-lambda * deltaT) where lambda = ln(2) / 30
 */
export function calculateRecencyWeight(lastObservedAt: string): number {
  const now = new Date().getTime();
  const obs = new Date(lastObservedAt).getTime();
  const diffDays = Math.max(0, (now - obs) / (1000 * 3600 * 24));
  const lambda = Math.LN2 / HALF_LIFE_DAYS;
  return Math.exp(-lambda * diffDays);
}

/**
 * Computes deterministic signal confidence considering sample size and baseline variance.
 */
export function calculateSignalConfidence(
  sampleSize: number,
  value: number,
  baseline: number = 0.5
): number {
  if (sampleSize <= 0) return 0;

  const sizeFactor = Math.min(1.0, sampleSize / MIN_SAMPLE_SIZE);
  const diff = Math.abs(value - baseline);
  const varianceFactor = 1.0 - 1.0 / (1.0 + sampleSize * diff);

  return Math.max(0.1, Math.min(0.99, sizeFactor * varianceFactor));
}

/**
 * Aggregates raw Dexie behavior events into statistical DerivedSignals.
 */
export async function aggregateUserSignals(): Promise<DerivedSignal[]> {
  if (typeof window === 'undefined') return [];

  try {
    const events = await db.behaviorEvents.toArray();
    if (events.length === 0) return [];

    const categorySlots: Record<string, Record<string, { total: number; completed: number }>> = {};

    for (const evt of events) {
      if (evt.eventType === 'TASK_COMPLETED' && evt.metadata?.category && evt.metadata?.timeSlot) {
        const cat = evt.metadata.category;
        const slot = evt.metadata.timeSlot;

        if (!categorySlots[cat]) categorySlots[cat] = {};
        if (!categorySlots[cat][slot]) categorySlots[cat][slot] = { total: 0, completed: 0 };

        categorySlots[cat][slot].total += 1;
        categorySlots[cat][slot].completed += 1;
      }
    }

    const derivedSignals: DerivedSignal[] = [];

    for (const [cat, slots] of Object.entries(categorySlots)) {
      for (const [slot, counts] of Object.entries(slots)) {
        const value = counts.completed / Math.max(1, counts.total);
        const confidence = calculateSignalConfidence(counts.total, value);

        derivedSignals.push({
          userId: 'local-user',
          signalKey: `${cat.toLowerCase()}_${slot}_completion_affinity`,
          category: cat,
          timeSlot: slot as any,
          value,
          sampleSize: counts.total,
          confidence,
          lastObservedAt: new Date().toISOString(),
          observationWindowDays: 30,
          recencyWeight: 1.0,
          baseline: 0.5,
        });
      }
    }

    // Save derived signals to Dexie
    for (const sig of derivedSignals) {
      await db.derivedSignals.put(sig);
    }

    return derivedSignals;
  } catch (err) {
    console.warn('[SignalAggregator] Failed to aggregate signals:', err);
    return [];
  }
}
