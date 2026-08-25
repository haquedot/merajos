import { connectToDatabase } from '../mongodb';
import User from '../../models/User';
import { encryptToken, decryptToken } from './encryption';


export class GoogleAuthRequiredError extends Error {
  constructor(message = 'Google account connection required') {
    super(message);
    this.name = 'GoogleAuthRequiredError';
  }
}

export class GoogleReauthRequiredError extends Error {
  constructor(message = 'Google OAuth authorization revoked or expired. Re-authentication required.') {
    super(message);
    this.name = 'GoogleReauthRequiredError';
  }
}

class GoogleTokenService {
  private refreshPromises: Map<string, Promise<string>> = new Map();

  /**
   * Retrieves a valid Google Access Token for the given user.
   * Auto-refreshes using stored encrypted refresh token if expired.
   */
  public async getValidAccessToken(userIdOrEmail: string): Promise<string> {
    await connectToDatabase();

    const user = await User.findOne({
      $or: [{ _id: userIdOrEmail }, { email: userIdOrEmail }],
    });

    if (!user || !user.google?.connected || !user.google?.refreshTokenEncrypted) {
      throw new GoogleAuthRequiredError();
    }

    const { accessTokenEncrypted, accessTokenExpiresAt } = user.google;

    // 1. Check if existing access token is still valid (> 5 minutes remaining)
    if (
      accessTokenEncrypted &&
      accessTokenExpiresAt &&
      new Date(accessTokenExpiresAt).getTime() > Date.now() + 5 * 60 * 1000
    ) {
      try {
        return decryptToken(accessTokenEncrypted);
      } catch (err) {
        console.warn('[GoogleTokenService] Failed to decrypt access token, forcing refresh');
      }
    }

    // 2. Token expired or invalid -> trigger concurrency-locked refresh
    return this.refreshAccessToken(userIdOrEmail);
  }

  /**
   * Performs Google OAuth refresh token exchange with concurrency locking per user.
   */
  public async refreshAccessToken(userIdOrEmail: string): Promise<string> {
    // Return in-flight refresh promise if present to prevent concurrent redundant refresh requests
    if (this.refreshPromises.has(userIdOrEmail)) {
      return this.refreshPromises.get(userIdOrEmail)!;
    }

    const refreshPromise = (async () => {
      await connectToDatabase();

      const user = await User.findOne({
        $or: [{ _id: userIdOrEmail }, { email: userIdOrEmail }],
      });

      if (!user || !user.google?.refreshTokenEncrypted) {
        throw new GoogleAuthRequiredError();
      }

      let refreshToken = '';
      try {
        refreshToken = decryptToken(user.google.refreshTokenEncrypted);
      } catch (err) {
        user.google.syncStatus = 'reauth_required';
        await user.save();
        throw new GoogleReauthRequiredError('Corrupted refresh token. Please reconnect Google.');
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured on server (GOOGLE_CLIENT_SECRET)');
      }

      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          console.warn('[GoogleTokenService] Refresh failed:', data);

          // If user revoked access or token expired
          if (data.error === 'invalid_grant' || data.error === 'unauthorized_client') {
            user.google.syncStatus = 'reauth_required';
            await user.save();
            throw new GoogleReauthRequiredError();
          }

          throw new Error(`Google OAuth Refresh Error: ${data.error_description || data.error}`);
        }

        const newAccessToken = data.access_token;
        const expiresInSeconds = data.expires_in || 3600;

        // Encrypt and persist new access token
        user.google.accessTokenEncrypted = encryptToken(newAccessToken);
        user.google.accessTokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        user.google.syncStatus = 'connected';
        await user.save();

        return newAccessToken;
      } catch (err) {
        if (err instanceof GoogleReauthRequiredError) {
          throw err;
        }
        console.error('[GoogleTokenService] Token refresh network/server error:', err);
        throw err;
      }
    })();

    // Store in-flight promise lock
    this.refreshPromises.set(userIdOrEmail, refreshPromise);

    try {
      return await refreshPromise;
    } finally {
      // Clear promise lock when finished
      this.refreshPromises.delete(userIdOrEmail);
    }
  }

  /**
   * Disconnects Google OAuth connection for a user.
   */
  public async revokeConnection(userIdOrEmail: string): Promise<void> {
    await connectToDatabase();
    const user = await User.findOne({
      $or: [{ _id: userIdOrEmail }, { email: userIdOrEmail }],
    });

    if (user && user.google) {
      user.google.connected = false;
      user.google.refreshTokenEncrypted = undefined;
      user.google.accessTokenEncrypted = undefined;
      user.google.syncStatus = 'reauth_required';
      await user.save();
    }
  }
}

export const googleTokenService = new GoogleTokenService();
