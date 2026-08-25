import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { encryptToken } from '@/lib/google/encryption';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing authorization code parameter' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Google OAuth server credentials not configured' },
        { status: 500 }
      );
    }

    // 1. Exchange authorization code with Google OAuth token endpoint
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[Google OAuth Callback] Token exchange failed:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.error_description || data.error || 'Failed to exchange authorization code with Google',
        },
        { status: 400 }
      );
    }

    const { access_token, refresh_token, expires_in } = data;

    // 2. Fetch verified Google user profile using newly issued access token
    let userEmail = '';
    let userName = '';
    let userPicture = '';
    let googleSub = '';

    try {
      const uRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        userEmail = (uData.email || '').toLowerCase().trim();
        userName = uData.name || '';
        userPicture = uData.picture || '';
        googleSub = uData.sub || '';
      }
    } catch (e) {
      console.warn('[Google OAuth Callback] Failed to fetch Google profile info:', e);
    }

    // Fallback: If userinfo call failed, check existing auth session header
    if (!userEmail) {
      const authResult = await verifyAuth(req);
      if (authResult.authenticated) {
        userEmail = authResult.user.userEmail;
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Failed to identify Google user email from token response' },
        { status: 400 }
      );
    }

    // 3. Connect to MongoDB and find or create User document
    await connectToDatabase();
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = new User({
        email: userEmail,
        googleId: googleSub || userEmail,
        name: userName || userEmail.split('@')[0],
        picture: userPicture,
        role: 'professional',
        onboardingCompleted: true,
      });
    } else {
      if (userName && !user.name) user.name = userName;
      if (userPicture) user.picture = userPicture;
      if (googleSub && !user.googleId) user.googleId = googleSub;
    }

    // 4. Update google sub-document
    if (!user.google) {
      user.google = {
        connected: true,
        email: userEmail,
        syncStatus: 'connected',
      };
    }

    user.google.connected = true;
    user.google.email = userEmail;
    user.google.accessTokenEncrypted = encryptToken(access_token);
    user.google.accessTokenExpiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);
    user.google.syncStatus = 'connected';
    user.google.connectedAt = new Date();

    // Preserve existing refresh token if Google didn't issue a new one in this consent prompt
    if (refresh_token) {
      user.google.refreshTokenEncrypted = encryptToken(refresh_token);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      accessToken: access_token,
      google: {
        connected: true,
        email: userEmail,
        name: user.name || userName,
        picture: user.picture || userPicture,
        syncStatus: 'connected',
      },
    });
  } catch (err: any) {
    console.error('[Google OAuth Callback] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error processing Google OAuth callback', details: err.message },
      { status: 500 }
    );
  }
}
