import { NextResponse } from 'next/server';
import { calculateDailyTasksAndLogAnalytics } from '../../../../lib/cronCalculation';

export async function GET() {
  try {
    const result = await calculateDailyTasksAndLogAnalytics();
    return NextResponse.json({
      message: '11:45 PM Daily tasks and analytics successfully calculated and persisted to MongoDB',
      snapshot: result.snapshot,
      emailResult: result.emailResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let clientTasks: any[] = [];
    let emailOptions: { enabled?: boolean; recipientEmail?: string } | undefined = undefined;

    try {
      const body = await req.json();
      if (body) {
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

    const result = await calculateDailyTasksAndLogAnalytics(clientTasks, emailOptions);
    return NextResponse.json({
      message: '11:45 PM Daily tasks and analytics successfully calculated and persisted to MongoDB',
      snapshot: result.snapshot,
      emailResult: result.emailResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
