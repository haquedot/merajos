import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Note from '../../../models/Note';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const notes = await Note.find({
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = notes.map((n: any) => ({ ...n, id: n._id }));
    return NextResponse.json({ notes: formatted });
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
    const id = body.id || `n-${Date.now()}`;

    const newNote = await Note.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ note: { ...newNote, id: (newNote as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ note: { ...updatedNote, id: (updatedNote as any)._id } });
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
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    await Note.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
