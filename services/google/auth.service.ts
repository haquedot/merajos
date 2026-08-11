import { db, GoogleAccountSession } from '../../database/dexie';

declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '847306520518-3raubtg9ajcg8ebsjr91mkgjm9j2vqqt.apps.googleusercontent.com';
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
  private tokenClient: any = null;

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

  public async signIn(): Promise<GoogleAccountSession> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Browser environment required for Google OAuth'));
      }

      if (!window.google || !window.google.accounts) {
        return reject(new Error('Google OAuth client library not loaded yet'));
      }

      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              return reject(tokenResponse);
            }

            const accessToken = tokenResponse.access_token;
            const expiresIn = tokenResponse.expires_in || 3600;

            let profile: UserProfile = {
              name: '',
              email: '',
              picture: '',
            };

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (res.ok) {
                const data = await res.json();
                profile = {
                  name: data.name || '',
                  email: data.email || '',
                  picture: data.picture || '',
                };
              }
            } catch (err) {
              console.warn('Failed to fetch Google profile info', err);
            }

            const session: GoogleAccountSession = {
              id: 'me',
              accessToken,
              refreshToken: null,
              expiresAt: Date.now() + expiresIn * 1000,
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
              connectedCalendars: [{ id: 'primary', summary: 'Primary', color: '#3b82f6' }],
              connectedTaskLists: [{ id: '@default', title: 'My Tasks' }],
            };

            await db.googleSession.put(session);

            // Sync user profile directly to MongoDB database
            if (profile.email) {
              fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                }),
              }).catch((err) => console.warn('Failed to sync user to MongoDB', err));
            }

            resolve(session);
          },
        });

        this.tokenClient.requestAccessToken();
      } catch (err) {
        console.error('[AuthService] Token client init failed:', err);
        reject(err);
      }
    });
  }

  public async signOut(): Promise<void> {
    await db.googleSession.delete('me');
  }

  public async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    if (!session) return null;

    // If token is expired or expiring within 5 minutes, attempt silent refresh
    if (session.expiresAt && Date.now() > session.expiresAt - 5 * 60 * 1000) {
      console.log('[AuthService] Token expiring soon. Refreshing silently...');
      const refreshedSession = await this.refreshAccessTokenSilently();
      if (refreshedSession) {
        return refreshedSession.accessToken;
      }
    }

    return session.accessToken;
  }

  public async refreshAccessTokenSilently(): Promise<GoogleAccountSession | null> {
    if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          prompt: 'none',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error || !tokenResponse.access_token) {
              console.warn('[AuthService] Silent token refresh suppressed interactive popup:', tokenResponse.error);
              return resolve(null);
            }
            const session = await db.googleSession.get('me');
            if (session) {
              const updatedSession: GoogleAccountSession = {
                ...session,
                accessToken: tokenResponse.access_token,
                expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
              };
              await db.googleSession.put(updatedSession);
              return resolve(updatedSession);
            }
            resolve(null);
          },
        });
        client.requestAccessToken({ prompt: 'none' });
      } catch (err) {
        console.warn('[AuthService] Silent token refresh failed', err);
        resolve(null);
      }
    });
  }
}

export const authService = new AuthService();
