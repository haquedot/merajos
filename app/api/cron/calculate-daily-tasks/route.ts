import { NextResponse } from 'next/server';
import { calculateDailyTasksAndLogAnalytics } from '../../../../lib/cronCalculation';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get('date') || searchParams.get('targetDate') || undefined;

    const result = await calculateDailyTasksAndLogAnalytics(undefined, { sendEmail: true }, targetDate);
    return NextResponse.json({
      message: 'Daily tasks and analytics successfully calculated and persisted to MongoDB',
      snapshot: result.snapshot,
      emailResult: result.emailResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let targetDate = searchParams.get('date') || searchParams.get('targetDate') || undefined;
    let clientTasks: any[] = [];
    let emailOptions: { enabled?: boolean; recipientEmail?: string } | undefined = undefined;

    try {
      const body = await req.json();
      if (body) {
        if (body.targetDate || body.date) {
          targetDate = body.targetDate || body.date;
        }
        if (Array.isArray(body.tasks)) {
          clientTasks = body.tasks;
        }
        if (body.emailOptions) {
          emailOptions = body.emailOptions;
        } else if (body.emailNotificationsEnabled !== undefined || body.notificationEmail) {
          emailOptions = {
            enabled: body.emailNotificationsEnabled,
            recipientEmail: body.notificationEmail,
          };
        }
      }
    } catch (e) {
      // Body may be empty on direct cron calls
    }

    const result = await calculateDailyTasksAndLogAnalytics(clientTasks, emailOptions, targetDate);
    return NextResponse.json({
      message: 'Daily tasks and analytics successfully calculated and persisted to MongoDB',
      snapshot: result.snapshot,
      emailResult: result.emailResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
