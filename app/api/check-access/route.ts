import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import ApprovedTester from '../../../models/ApprovedTester';
import User from '../../../models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'haquedot@gmail.com').toLowerCase().trim();
    const smtpUser = (process.env.SMTP_USER || '').toLowerCase().trim();

    // 1. Admin / Owner emails are always authorized
    if (email === adminEmail || email === smtpUser || email === 'haquemeraj95@gmail.com' || email === 'merajulhaque.official@gmail.com') {
      return NextResponse.json({ allowed: true, reason: 'Admin / Owner' });
    }

    await connectToDatabase();

    // 2. Check ApprovedTester collection
    const approved = await ApprovedTester.findOne({ email });
    if (approved) {
      return NextResponse.json({ allowed: true, reason: 'Approved Tester' });
    }

    // 3. Check existing User record in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ allowed: true, reason: 'Registered User' });
    }

    // Otherwise not approved yet in beta
    return NextResponse.json({ allowed: false, reason: 'Unverified Google OAuth Tester' });
  } catch (err: any) {
    console.warn('[CheckAccess API Error]', err);
    // Default fallback: allow admin email, otherwise return allowed: false
    const adminEmail = (process.env.ADMIN_EMAIL || 'haquedot@gmail.com').toLowerCase().trim();
    const url = new URL(req.url);
    const email = url.searchParams.get('email')?.toLowerCase().trim();
    if (email === adminEmail || email === 'haquemeraj95@gmail.com') {
      return NextResponse.json({ allowed: true });
    }
    return NextResponse.json({ allowed: false, error: err.message });
  }
}
