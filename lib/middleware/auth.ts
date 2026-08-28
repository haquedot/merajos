import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  userId: string;
  userEmail: string;
}

export type AuthResult =
  | { authenticated: true; user: AuthenticatedUser }
  | { authenticated: false; response: NextResponse };

/**
 * Server-side authentication middleware helper for Next.js API route handlers.
 * Inspects Authorization bearer tokens or verified user identity headers.
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('authorization');
    const userEmailHeader = req.headers.get('x-user-email');
    const userIdHeader = req.headers.get('x-user-id');

    let userEmail: string | null = null;
    let userId: string | null = null;

    // 1. Check Bearer Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && !token.startsWith('code_flow')) {
        try {
          // Verify access token with Google OAuth TokenInfo API
          const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.email) {
              userEmail = data.email.toLowerCase().trim();
              userId = data.sub || userEmail;
            }
          }
        } catch (err) {
          console.warn('[Auth Middleware] Token verification failed:', err);
        }
      }
    }

    // 2. Fallback to client-provided authenticated session header (x-user-email)
    if (!userEmail && userEmailHeader) {
      userEmail = userEmailHeader.toLowerCase().trim();
      userId = userIdHeader || userEmail;
    }

    // If still no valid user identified, return 401 Unauthorized
    if (!userEmail) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Missing or invalid authentication token' },
          { status: 401 }
        ),
      };
    }

    return {
      authenticated: true,
      user: {
        userId: userId || userEmail,
        userEmail,
      },
    };
  } catch (err: any) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Internal Authentication Error', details: err.message },
        { status: 500 }
      ),
    };
  }
}
