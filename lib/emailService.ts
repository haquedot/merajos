import nodemailer from 'nodemailer';
import { IDailyAnalyticsSnapshot } from '../models/DailyAnalyticsSnapshot';

export async function sendDailyTaskLogEmail(
  snapshot: Partial<IDailyAnalyticsSnapshot>,
  tasksList: any[] = [],
  options?: { enabled?: boolean; recipientEmail?: string }
) {
  if (options?.enabled === false) {
    console.log('[Nodemailer] Email notifications disabled in Settings. Skipping dispatch.');
    return { sent: false, reason: 'Email notifications disabled in Settings' };
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const recipientEmail =
    options?.recipientEmail ||
    process.env.NOTIFICATION_EMAIL ||
    process.env.EMAIL_TO ||
    smtpUser ||
    'merajulhaque.official@gmail.com';

  const dateStr = snapshot.date || new Date().toISOString().split('T')[0];
  const score = snapshot.productivityScore ?? snapshot.taskCompletionRate ?? 0;

  // Extract completed & pending task items directly from tasksList or snapshot
  let completedItems: any[] = [];
  let pendingItems: any[] = [];

  if (tasksList && tasksList.length > 0) {
    completedItems = tasksList.filter((t) => t.status === 'completed');
    pendingItems = tasksList.filter((t) => t.status !== 'completed');
  } else if (snapshot.completedTaskDetails && snapshot.completedTaskDetails.length > 0) {
    completedItems = snapshot.completedTaskDetails;
    pendingItems = snapshot.pendingTaskDetails || [];
  } else if (snapshot.completedTaskTitles && snapshot.completedTaskTitles.length > 0) {
    completedItems = snapshot.completedTaskTitles.map((t) => ({ title: t, category: 'Personal', priority: 'medium' }));
    pendingItems = (snapshot.pendingTaskTitles || []).map((t) => ({ title: t, category: 'Personal', priority: 'medium' }));
  }

  const completedCount = completedItems.length;
  const pendingCount = pendingItems.length;
  const totalCount = completedCount + pendingCount;

  // Professional, human-designed solid email HTML (Zero AI emojis, solid corporate colors)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Task Log — ${dateStr}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0f172a; }
          .wrapper { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
          .header { background-color: #0f172a; color: #ffffff; padding: 20px 24px; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
          .body-content { padding: 24px; }
          .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; text-align: center; border-radius: 6px; }
          .summary-num { font-size: 22px; font-weight: 800; font-family: monospace; }
          .summary-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-top: 4px; }
          .section-header { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; margin-top: 24px; margin-bottom: 12px; color: #1e293b; }
          .task-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .task-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 8px 10px; background: #f8fafc; border-bottom: 1px solid #cbd5e1; }
          .task-table td { padding: 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
          .tag { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; background: #e2e8f0; color: #334155; }
          .tag-completed { background: #dcfce7; color: #166534; }
          .tag-pending { background: #fef3c7; color: #92400e; }
          .priority-urgent { color: #dc2626; font-weight: 700; }
          .priority-high { color: #ea580c; font-weight: 700; }
          .priority-medium { color: #0284c7; font-weight: 600; }
          .priority-low { color: #64748b; }
          .empty-state { font-size: 12px; color: #64748b; font-style: italic; padding: 8px 0; }
          .footer { background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Orbit — Daily Task Log</h1>
            <p>Plan. Focus. Execute. Grow. | Performance Summary for ${dateStr}</p>
          </div>

          <div class="body-content">
            <!-- Metric Cards -->
            <table class="summary-table">
              <tr>
                <td width="32%" style="padding-right: 8px;">
                  <div class="summary-card">
                    <div class="summary-num" style="color: #059669;">${completedCount}</div>
                    <div class="summary-label">Completed</div>
                  </div>
                </td>
                <td width="32%" style="padding: 0 4px;">
                  <div class="summary-card">
                    <div class="summary-num" style="color: #d97706;">${pendingCount}</div>
                    <div class="summary-label">Pending</div>
                  </div>
                </td>
                <td width="32%" style="padding-left: 8px;">
                  <div class="summary-card">
                    <div class="summary-num" style="color: #2563eb;">${score}%</div>
                    <div class="summary-label">Score</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Completed Tasks Table -->
            <div class="section-header">Completed Tasks (${completedCount})</div>
            ${
              completedCount > 0
                ? `<table class="task-table">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th width="110">Category</th>
                        <th width="80">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${completedItems
                        .map(
                          (t: any) => `
                          <tr>
                            <td style="font-weight: 600;">${t.title || 'Untitled Task'}</td>
                            <td><span class="tag">${t.category || 'Personal'}</span></td>
                            <td><span class="priority-${(t.priority || 'medium').toLowerCase()}">${(t.priority || 'medium').toUpperCase()}</span></td>
                          </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>`
                : `<div class="empty-state">No tasks completed on this date.</div>`
            }

            <!-- Pending / Non-Completed Tasks Table -->
            <div class="section-header">Non-Completed Tasks (${pendingCount})</div>
            ${
              pendingCount > 0
                ? `<table class="task-table">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th width="110">Category</th>
                        <th width="80">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendingItems
                        .map(
                          (t: any) => `
                          <tr>
                            <td style="font-weight: 600;">${t.title || 'Untitled Task'}</td>
                            <td><span class="tag">${t.category || 'Personal'}</span></td>
                            <td><span class="priority-${(t.priority || 'medium').toLowerCase()}">${(t.priority || 'medium').toUpperCase()}</span></td>
                          </tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>`
                : `<div class="empty-state">All scheduled tasks were completed.</div>`
            }
          </div>

          <div class="footer">
            Automated Log Report generated by Orbit Core — Plan. Focus. Execute. Grow.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!smtpUser || !smtpPass) {
    console.warn('[Nodemailer] SMTP credentials not set (SMTP_USER / SMTP_PASS in .env.local). Email skipped.');
    return {
      sent: false,
      reason: 'SMTP_USER and SMTP_PASS environment variables are not configured in .env.local',
      htmlContent,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Orbit Productivity" <${smtpUser}>`,
      to: recipientEmail,
      subject: `Orbit Daily Task Log — ${dateStr} (Score: ${score}%)`,
      html: htmlContent,
    });

    console.log('[Nodemailer] Daily Task Log Email sent:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Nodemailer] Error sending daily task log email:', err);
    return { sent: false, reason: err.message };
  }
}
