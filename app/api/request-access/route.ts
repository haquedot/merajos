import { NextResponse } from 'next/server';
import { sendBetaAccessRequestEmails } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, note } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const result = await sendBetaAccessRequestEmails(email, note);

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully. Check your email inbox!',
      result,
    });
  } catch (err: any) {
    console.error('[RequestAccess API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit access request' },
      { status: 500 }
    );
  }
}
