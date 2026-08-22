import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Weekly from '../../../models/Weekly';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const plan = await Weekly.findOne({
      $or: [{ userId }, { userEmail }, { _id: 'Current-Week' }],
    }).lean();

    if (!plan) {
      return NextResponse.json({ plan: null });
    }
    return NextResponse.json({ plan: { ...plan, weekId: plan._id } });
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
    const weekId = body.weekId ? `${body.weekId}-${userId}` : `Current-Week-${userId}`;

    const updatedPlan = await Weekly.findOneAndUpdate(
      { _id: weekId },
      { ...body, _id: weekId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ plan: { ...updatedPlan, weekId: (updatedPlan as any)._id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
