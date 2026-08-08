import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Weekly from '../../../models/Weekly';

export async function GET() {
  try {
    await connectToDatabase();
    const plan = await Weekly.findById('Current-Week').lean();
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
    await connectToDatabase();
    const body = await req.json();
    const weekId = body.weekId || 'Current-Week';
    
    const updatedPlan = await Weekly.findByIdAndUpdate(
      weekId,
      { ...body, _id: weekId },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ plan: { ...updatedPlan, weekId: (updatedPlan as any)._id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
