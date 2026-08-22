import { IDailyAnalyticsSnapshot } from '../models/DailyAnalyticsSnapshot';

export function generateDailyTaskLogHtml(
  snapshot: Partial<IDailyAnalyticsSnapshot>,
  dateStr: string,
  score: number,
  completedCount: number,
  pendingCount: number,
  completedItems: any[],
  pendingItems: any[]
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Orbit Daily Performance Summary — ${dateStr}</title>
        <style>
          :root {
            color-scheme: light;
            supported-color-schemes: light;
          }
          body, html { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
          * { box-sizing: border-box; }
          table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
          
          .logo-container {
            background-color: #ffffff !important;
            background: #ffffff !important;
          }

          @media (prefers-color-scheme: dark) {
            .logo-container, [data-ogsc] .logo-container {
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
          }

          @media only screen and (max-width: 580px) {
            .wrapper { width: 100% !important; max-width: 100% !important; padding: 0 !important; }
            .content-box { border-radius: 0 !important; border-left: none !important; border-right: none !important; }
            .header-padding { padding: 20px 16px !important; }
            .body-padding { padding: 20px 14px !important; }
            .stat-cell { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
            .stat-cell-last { display: block !important; width: 100% !important; padding: 0 !important; }
            .task-table { display: table !important; width: 100% !important; }
            .task-table th { font-size: 10px !important; padding: 6px 4px !important; }
            .task-table td { padding: 8px 4px !important; font-size: 12px !important; }
            .task-title { font-size: 12px !important; word-break: break-word !important; }
            .badge { font-size: 9px !important; padding: 2px 5px !important; }
          }
        </style>
      </head>
      <body style="background-color: #f8fafc; margin: 0; padding: 24px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 0 12px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapper" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                
                <tr>
                  <td class="header-padding" style="background-color: #0b1120; background-image: linear-gradient(135deg, #0b1120 0%, #1e293b 100%); padding: 28px 28px 24px 28px; border-bottom: 3px solid #3b82f6;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="vertical-align: middle;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 12px;">
                                <table border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" class="logo-container" style="background-color: #ffffff !important; background: #ffffff !important; border-radius: 10px;">
                                  <tr>
                                    <td bgcolor="#ffffff" class="logo-container" style="background-color: #ffffff !important; background: #ffffff !important; padding: 5px; border-radius: 10px;">
                                      <img src="https://orbit.merajulhaque.com/logos/orbit-light-icon.png" width="38" height="38" alt="Orbit Logo" style="display: block; width: 38px; height: 38px;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: middle;">
                                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: block; line-height: 1;">Orbit</span>
                                <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; display: block;">Plan. Focus. Execute. Grow.</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <span style="display: inline-block; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #60a5fa; white-space: nowrap;">
                            ${dateStr}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="body-padding" style="padding: 28px 28px;">
                    <div style="margin-bottom: 24px;">
                      <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #0f172a;">Daily Performance Summary</h2>
                      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Here is your daily task execution overview for <strong>${dateStr}</strong> synced with your Orbit Workspace.</p>
                    </div>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td class="stat-cell" width="32%" style="padding-right: 8px;">
                          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: #166534; font-family: monospace; line-height: 1;">${completedCount}</div>
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #15803d; margin-top: 6px;">Completed</div>
                          </div>
                        </td>
                        <td class="stat-cell" width="32%" style="padding: 0 4px;">
                          <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: #92400e; font-family: monospace; line-height: 1;">${pendingCount}</div>
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #b45309; margin-top: 6px;">Pending</div>
                          </div>
                        </td>
                        <td class="stat-cell-last" width="32%" style="padding-left: 8px;">
                          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 10px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: #1e40af; font-family: monospace; line-height: 1;">${score}%</div>
                            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1d4ed8; margin-top: 6px;">Completion Score</div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #15803d; padding-bottom: 8px; border-bottom: 2px solid #dcfce7; margin-top: 12px; margin-bottom: 12px;">
                      ✓ Completed Tasks (${completedCount})
                    </div>
                    ${completedCount > 0 ? renderTaskTable(completedItems) : `<div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 12px 0 24px 0;">No tasks were completed on this date.</div>`}

                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #b45309; padding-bottom: 8px; border-bottom: 2px solid #fef3c7; margin-top: 12px; margin-bottom: 12px;">
                      ⏳ Non-Completed Tasks (${pendingCount})
                    </div>
                    ${pendingCount > 0 ? renderTaskTable(pendingItems) : `<div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 12px 0 24px 0;">All scheduled tasks were completed!</div>`}

                    <div align="center" style="margin-top: 24px; margin-bottom: 8px;">
                      <a href="https://orbit.merajulhaque.com" target="_blank" style="display: inline-block; background-color: #1f3b99; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 4px rgba(31, 59, 153, 0.25);">
                        Open Orbit Workspace →
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <img src="https://orbit.merajulhaque.com/logos/orbit-light-icon.png" width="24" height="24" alt="Orbit Logo" style="display: block; margin-bottom: 8px; opacity: 0.8;" />
                          <p style="margin: 0; font-size: 11px; font-weight: 700; color: #475569;">
                            Orbit Productivity Command Center
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 10px; color: #94a3b8;">
                            Plan. Focus. Execute. Grow. • Automated Daily Performance Log
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function renderTaskTable(items: any[]): string {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="task-table" style="margin-bottom: 24px; table-layout: auto;">
      <thead>
        <tr style="background-color: #f8fafc;">
          <th align="left" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; width: 55%;">Task Title</th>
          <th align="left" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; width: 25%;">Category</th>
          <th align="right" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; width: 20%;">Priority</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((t: any) => {
            const cat = t.category || 'Personal';
            const prio = (t.priority || 'medium').toLowerCase();

            let catBg = '#e2e8f0';
            let catColor = '#334155';
            if (cat === 'Client') { catBg = '#ede9fe'; catColor = '#6d28d9'; }
            else if (cat === 'Research') { catBg = '#dbeafe'; catColor = '#1e40af'; }
            else if (cat === 'Career') { catBg = '#d1fae5'; catColor = '#065f46'; }
            else if (cat === 'Personal') { catBg = '#fef3c7'; catColor = '#92400e'; }

            let prioColor = '#0284c7';
            if (prio === 'urgent') prioColor = '#dc2626';
            else if (prio === 'high') prioColor = '#ea580c';
            else if (prio === 'low') prioColor = '#64748b';

            return `
              <tr>
                <td class="task-title" style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9; word-break: break-word; overflow-wrap: anywhere;">
                  ${t.title || 'Untitled Task'}
                </td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;">
                  <span class="badge" style="display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; background-color: ${catBg}; color: ${catColor}; white-space: nowrap;">
                    ${cat}
                  </span>
                </td>
                <td align="right" style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;">
                  <span style="font-size: 11px; font-weight: 800; color: ${prioColor}; text-transform: uppercase;">
                    ${prio}
                  </span>
                </td>
              </tr>`;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

export function generateAdminAccessRequestHtml(userEmail: string, userNote?: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #1f3b99; margin-top: 0;">🚀 New Orbit Beta Access Request</h2>
        <p style="font-size: 14px; color: #334155;">A user attempted to sign in with Google but was blocked because Orbit is in Google Beta Testing mode:</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; font-size: 13px; margin: 16px 0;">
          <p style="margin: 0 0 6px 0;"><strong>User Email:</strong> <a href="mailto:${userEmail}" style="color: #2563eb;">${userEmail}</a></p>
          <p style="margin: 0 0 6px 0;"><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 0;"><strong>User Message:</strong> ${userNote || 'None provided'}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;"><strong>Action Required:</strong> Add <code>${userEmail}</code> under Google Cloud Console OAuth Test Users.</p>
      </div>
    </div>
  `;
}

export function generateUserAccessConfirmationHtml(userEmail: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #1f3b99; margin-top: 0;">✨ Beta Access Request Received!</h2>
        <p style="font-size: 14px; color: #334155;">Thank you for requesting Google Beta access for <strong>${userEmail}</strong> on <strong>Orbit</strong>.</p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6;">Our developer team has been notified. You can explore all features of Orbit using our <strong>Guest / Offline Mode</strong>!</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://orbit.merajulhaque.com" style="display: inline-block; background-color: #1f3b99; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Continue as Guest →
          </a>
        </div>
      </div>
    </div>
  `;
}
