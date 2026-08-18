export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initNodeCron } = await import('./lib/cron');
    initNodeCron();
  }
}
