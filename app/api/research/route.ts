import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Research from '../../../models/Research';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const docId = `research-${userId}`;

    let doc = await Research.findOne({
      $or: [{ _id: docId }, { userId }, { userEmail }, { _id: 'research-main' }],
    }).lean();

    if (!doc) {
      return NextResponse.json({ projects: [] });
    }
    return NextResponse.json({ projects: (doc as any).projects ?? [] });
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
    const { projects } = body;
    const docId = `research-${userId}`;

    const updated = await Research.findOneAndUpdate(
      { _id: docId },
      { projects, _id: docId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ projects: (updated as any)?.projects ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
