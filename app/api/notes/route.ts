import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Note from '../../../models/Note';

export async function GET() {
  try {
    await connectToDatabase();
    const notes = await Note.find({}).sort({ updatedAt: -1 }).lean();
    const formatted = notes.map((n: any) => ({ ...n, id: n._id }));
    return NextResponse.json({ notes: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `n-${Date.now()}`;
    
    const newNote = await Note.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ note: { ...newNote, id: (newNote as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    const updatedNote = await Note.findByIdAndUpdate(id, updates, { returnDocument: 'after' }).lean();
    return NextResponse.json({ note: { ...updatedNote, id: (updatedNote as any)._id } });
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
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    await Note.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
