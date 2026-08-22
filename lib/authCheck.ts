import { db } from '../database/dexie';

/**
 * Checks whether the current user is authenticated with a Google session.
 * If true -> user is signed in, allow MongoDB API sync.
 * If false -> user is in Guest Mode, do NOT make backend API calls.
 */
export async function isUserAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const session = await db.googleSession.get('me');
    return !!(session && session.accessToken);
  } catch (err) {
    return false;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  try {
    const session = await db.googleSession.get('me');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    if (session?.email) {
      headers['x-user-email'] = session.email;
      headers['x-user-id'] = session.id || session.email;
    }
    return headers;
  } catch (err) {
    return { 'Content-Type': 'application/json' };
  }
}
