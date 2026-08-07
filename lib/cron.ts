import cron from 'node-cron';
import { calculateDailyTasksAndLogAnalytics } from './cronCalculation';

let isCronStarted = false;

export function initNodeCron() {
  if (isCronStarted) return;
  isCronStarted = true;

  console.log('[NodeCron] Initializing cron scheduler. Scheduled daily task calculation at 11:45 PM (45 23 * * *)');

  // Schedule task calculation every day at 11:45 PM (23:45)
  cron.schedule('45 23 * * *', async () => {
    console.log('[NodeCron 11:45 PM] Running scheduled 11:45 PM daily task calculation...');
    try {
      await calculateDailyTasksAndLogAnalytics();
    } catch (err) {
      console.error('[NodeCron] Failed to calculate daily tasks at 11:45 PM:', err);
    }
  });
}
