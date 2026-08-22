import nodemailer from 'nodemailer';
import { IDailyAnalyticsSnapshot } from '../models/DailyAnalyticsSnapshot';
import {
  generateDailyTaskLogHtml,
  generateAdminAccessRequestHtml,
  generateUserAccessConfirmationHtml,
} from './emailTemplates';

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
    smtpUser;

  const dateStr = snapshot.date || new Date().toISOString().split('T')[0];
  const score = snapshot.productivityScore ?? snapshot.taskCompletionRate ?? 0;

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

  const htmlContent = generateDailyTaskLogHtml(
    snapshot,
    dateStr,
    score,
    completedCount,
    pendingCount,
    completedItems,
    pendingItems
  );

  if (!smtpUser || !smtpPass) {
    console.warn('[Nodemailer] SMTP credentials not set (SMTP_USER / SMTP_PASS). Email skipped.');
    return {
      sent: false,
      reason: 'SMTP credentials missing',
      htmlContent,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
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

export async function sendBetaAccessRequestEmails(userEmail: string, userNote?: string) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const adminEmail = process.env.ADMIN_EMAIL || 'haquedot@gmail.com';

  if (!smtpUser || !smtpPass) {
    console.warn('[Nodemailer] SMTP credentials missing. Skipping email dispatch.');
    return { sent: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Orbit Access Control" <${smtpUser}>`,
      to: adminEmail,
      subject: `[Orbit] Google Beta Access Request from ${userEmail}`,
      html: generateAdminAccessRequestHtml(userEmail, userNote),
    });

    await transporter.sendMail({
      from: `"Orbit" <${smtpUser}>`,
      to: userEmail,
      subject: `[Orbit] Beta Access Request Submitted`,
      html: generateUserAccessConfirmationHtml(userEmail),
    });

    return { sent: true };
  } catch (err: any) {
    console.error('[Nodemailer] Error sending access request email:', err);
    return { sent: false, reason: err.message };
  }
}
