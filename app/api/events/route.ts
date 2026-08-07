import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import CalendarEvent from '../../../models/CalendarEvent';

export async function GET() {
  try {
    await connectToDatabase();
    const events = await CalendarEvent.find({}).sort({ startDate: 1 }).lean();
    const formatted = events.map((e: any) => ({ ...e, id: e._id }));
    return NextResponse.json({ events: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `evt-${Date.now()}`;
    
    const newEvt = await CalendarEvent.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ event: { ...newEvt, id: (newEvt as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const updatedEvt = await CalendarEvent.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updatedEvt) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: { ...updatedEvt, id: (updatedEvt as any)._id } });
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
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    await CalendarEvent.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
