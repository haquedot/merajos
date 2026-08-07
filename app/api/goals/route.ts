import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Goal from '../../../models/Goal';

export async function GET() {
  try {
    await connectToDatabase();
    const goals = await Goal.find({}).lean();
    const formatted = goals.map((g: any) => ({ ...g, id: g._id }));
    return NextResponse.json({ goals: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `g-${Date.now()}`;
    
    const newGoal = await Goal.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ goal: { ...newGoal, id: (newGoal as any)._id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(id, updates, { new: true }).lean();
    return NextResponse.json({ goal: { ...updatedGoal, id: (updatedGoal as any)._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Goal id is required' }, { status: 400 });
    }

    await Goal.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
