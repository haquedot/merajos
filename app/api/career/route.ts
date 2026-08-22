import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Career from '../../../models/Career';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const docId = `career-${userId}`;

    let career = await Career.findOne({
      $or: [{ _id: docId }, { userId }, { userEmail }, { _id: 'career-main' }],
    }).lean();

    if (!career) {
      return NextResponse.json({ career: null });
    }
    return NextResponse.json({ career: { ...career, id: (career as any)._id } });
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
    const docId = `career-${userId}`;

    const updated = await Career.findOneAndUpdate(
      { _id: docId },
      { ...body, _id: docId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ career: { ...updated, id: (updated as any)._id } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
