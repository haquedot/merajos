import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Settings from '../../../models/Settings';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const docId = `settings-${userId}`;

    let settings = await Settings.findOne({
      $or: [{ _id: docId }, { userId }, { userEmail }, { _id: 'user-settings' }],
    }).lean();

    if (!settings) {
      return NextResponse.json({ settings: null });
    }
    return NextResponse.json({ settings: { ...settings, id: settings._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const body = await req.json();
    const docId = `settings-${userId}`;

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: docId },
      { ...body, _id: docId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ settings: { ...updatedSettings, id: (updatedSettings as any)._id } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
