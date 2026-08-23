import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Note from '../../../../models/Note';
import { verifyAuth } from '../../../../lib/middleware/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const noteDoc = await Note.findOne({ _id: noteId }).lean();

    if (!noteDoc) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = { ...(noteDoc as any), id: (noteDoc as any)._id };

    // 1. If public, allow unrestricted view
    if (note.isPublic) {
      return NextResponse.json({ note, isPublicAccess: true });
    }

    // 2. Otherwise check authentication & ownership/email access
    const auth = await verifyAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'This note is private. Please sign in to view.' },
        { status: 401 }
      );
    }

    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const isOwner = note.userId === userId || note.userEmail === userEmail;
    const isSharedWithUser =
      userEmail && Array.isArray(note.sharedWithEmails) && note.sharedWithEmails.includes(userEmail);

    if (!isOwner && !isSharedWithUser) {
      return NextResponse.json(
        { error: 'You do not have permission to view this note.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ note, isOwner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const body = await req.json();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, $or: [{ userId }, { userEmail }] },
      { $set: { ...body, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Note not found or permission denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      note: { ...(updatedNote as any), id: (updatedNote as any)._id },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
