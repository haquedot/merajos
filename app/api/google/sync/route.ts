import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { googleTokenService, GoogleAuthRequiredError, GoogleReauthRequiredError } from '@/lib/google/googleTokenService';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      // Gracefully handle unauthenticated/Guest mode calls
      return NextResponse.json({ success: true, connected: false, syncStatus: 'disconnected' });
    }

    const { userEmail } = authResult.user;

    try {
      const accessToken = await googleTokenService.getValidAccessToken(userEmail);
      return NextResponse.json({
        success: true,
        connected: true,
        accessToken,
      });
    } catch (err: any) {
      if (err instanceof GoogleAuthRequiredError) {
        return NextResponse.json({ success: true, connected: false, syncStatus: 'disconnected' });
      }
      if (err instanceof GoogleReauthRequiredError) {
        return NextResponse.json({ success: true, connected: false, syncStatus: 'reauth_required' });
      }
      throw err;
    }
  } catch (err: any) {
    console.error('[Google Sync API] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to verify Google token status', details: err.message },
      { status: 500 }
    );
  }
}
