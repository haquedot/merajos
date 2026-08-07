import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Habit from '../../../models/Habit';

export async function GET() {
  try {
    await connectToDatabase();
    const habits = await Habit.find({}).lean();
    const formatted = habits.map((h: any) => ({ ...h, id: h._id }));
    return NextResponse.json({ habits: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `h-${Date.now()}`;
    
    const habitData = {
      _id: id,
      name: body.name || 'Untitled Habit',
      category: body.category || 'Personal',
      icon: body.icon || 'Activity',
      targetDaysPerWeek: body.targetDaysPerWeek ?? 7,
      currentStreak: body.currentStreak ?? 0,
      longestStreak: body.longestStreak ?? 0,
      history: body.history || {},
    };

    const newHabit = await Habit.findOneAndUpdate(
      { _id: id },
      { $set: habitData },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ habit: { ...(newHabit as any), id: (newHabit as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Habit id is required' }, { status: 400 });
    }

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ habit: { ...(updatedHabit as any), id: (updatedHabit as any)._id } });
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
      return NextResponse.json({ error: 'Habit id is required' }, { status: 400 });
    }

    await Habit.deleteOne({ _id: id });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

