import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Goal from '../../../models/Goal';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const goals = await Goal.find({
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    }).lean();

    const formatted = goals.map((g: any) => ({ ...g, id: g._id }));
    return NextResponse.json({ goals: formatted });
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
    const id = body.id || `g-${Date.now()}`;

    const newGoal = await Goal.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ goal: { ...newGoal, id: (newGoal as any)._id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedGoal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ goal: { ...updatedGoal, id: (updatedGoal as any)._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    await Goal.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
