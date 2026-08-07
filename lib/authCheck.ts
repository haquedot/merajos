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
