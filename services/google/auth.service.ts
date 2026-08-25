import { db, GoogleAccountSession } from '../../database/dexie';
import { getAuthHeaders } from '../../lib/authCheck';

declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

class AuthService {
  private codeClient: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initGoogleScript();
    }
  }

  private initGoogleScript() {
    if (document.getElementById('google-gis-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  public async getSession(): Promise<GoogleAccountSession | null> {
    try {
      const session = await db.googleSession.get('me');
      if (session && session.accessToken) {
        return session;
      }
    } catch (e) {
      console.warn('[AuthService] Could not fetch session from IndexedDB:', e);
    }
    return null;
  }

  /**
   * Interactive Sign-In triggered strictly by user gesture.
   * Uses Authorization Code Client flow to exchange code server-side for refresh tokens.
   */
  public async signIn(): Promise<GoogleAccountSession> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Browser environment required for Google OAuth'));
      }

      if (!window.google || !window.google.accounts) {
        return reject(new Error('Google OAuth client library not loaded yet'));
      }

      try {
        // Use Code Client (Authorization Code Flow) for Server-Side Refresh Token exchange
        if (window.google.accounts.oauth2.initCodeClient) {
          this.codeClient = window.google.accounts.oauth2.initCodeClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            ux_mode: 'popup',
            callback: async (codeResponse: any) => {
              if (codeResponse.error) {
                return reject(codeResponse);
              }

              const code = codeResponse.code;

              try {
                // Fetch auth headers or session info if present
                const headers = await getAuthHeaders();

                // Exchange authorization code server-side
                const res = await fetch('/api/auth/google/callback', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ code }),
                });

                const callbackData = await res.json();
                if (!res.ok || !callbackData.success) {
                  console.warn('[AuthService] Code exchange server callback error:', callbackData);
                  return reject(new Error(callbackData.error || 'Google Code exchange failed'));
                }

                const accessToken = callbackData.accessToken || 'code_flow_active';
                const googleInfo = callbackData.google || {};

                const session: GoogleAccountSession = {
                  id: 'me',
                  accessToken,
                  refreshToken: null,
                  expiresAt: Date.now() + 3600 * 1000,
                  email: googleInfo.email || '',
                  name: googleInfo.name || '',
                  picture: googleInfo.picture || '',
                  connectedCalendars: [{ id: 'primary', summary: 'Primary', color: '#3b82f6' }],
                  connectedTaskLists: [{ id: '@default', title: 'My Tasks' }],
                };

                await db.googleSession.put(session);
                resolve(session);
              } catch (err) {
                console.error('[AuthService] Server callback processing failed:', err);
                reject(err);
              }
            },
          });

          this.codeClient.requestCode();
        } else {
          // Fallback to implicit token client if initCodeClient unavailable
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) return reject(tokenResponse);
              const accessToken = tokenResponse.access_token;
              const session: GoogleAccountSession = {
                id: 'me',
                accessToken,
                refreshToken: null,
                expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
                email: '',
                name: '',
                picture: '',
                connectedCalendars: [{ id: 'primary', summary: 'Primary', color: '#3b82f6' }],
                connectedTaskLists: [{ id: '@default', title: 'My Tasks' }],
              };
              await db.googleSession.put(session);
              resolve(session);
            },
          });
          tokenClient.requestAccessToken();
        }
      } catch (err) {
        console.error('[AuthService] Code client init failed:', err);
        reject(err);
      }
    });
  }

  public async signOut(): Promise<void> {
    await db.googleSession.delete('me');
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/google/sync', { method: 'DELETE', headers }).catch(() => {});
    } catch (e) {}
  }

  /**
   * Retrieves a valid Google Access Token.
   * Leverages server-side refresh engine when local session expires.
   * ABSOLUTELY ZERO SILENT POPUPS OR PROMPT: NONE IFRAMES ARE CREATED IN BROWSER.
   */
  public async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    if (!session) return null;

    // 1. If local session token is valid (> 5 minutes remaining), return immediately
    if (session.accessToken && session.expiresAt && Date.now() < session.expiresAt - 5 * 60 * 1000) {
      return session.accessToken;
    }

    // 2. Token expired -> Fetch fresh token from server via GoogleTokenService proxy
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/google/sync', { headers });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          const updatedSession: GoogleAccountSession = {
            ...session,
            accessToken: data.accessToken,
            expiresAt: Date.now() + 3600 * 1000,
          };
          await db.googleSession.put(updatedSession);
          return data.accessToken;
        }
      }
    } catch (err) {
      console.warn('[AuthService] Server token auto-refresh fetch failed:', err);
    }

    // Never trigger popups automatically
    return session.accessToken || null;
  }
}

export const authService = new AuthService();
