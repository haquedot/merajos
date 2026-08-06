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
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.warn('[AuthService] Token expired.');
    }
    return session.accessToken;
  }
}

export const authService = new AuthService();
