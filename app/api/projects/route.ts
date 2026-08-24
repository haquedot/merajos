import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Project from '../../../models/Project';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const queryConditions: any[] = [{ userId }, { userId: { $exists: false } }];
    if (userEmail) {
      queryConditions.push({ userEmail });
      queryConditions.push({ 'sharedWith.email': userEmail.toLowerCase() });
    }

    const projects = await Project.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = projects.map((p: any) => ({ ...p, id: p._id }));
    return NextResponse.json({ projects: formatted });
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
    const id = body.id || `proj-${Date.now()}`;

    const newProj = await Project.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ project: { ...newProj, id: (newProj as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }

    // Check project ownership or edit access
    const existing = await Project.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isOwner = (existing as any).userId === userId || (userEmail && (existing as any).userEmail === userEmail) || !(existing as any).userId;
    const sharedEntry = userEmail && (existing as any).sharedWith?.find((s: any) => s.email.toLowerCase() === userEmail.toLowerCase());
    const isEditor = sharedEntry && sharedEntry.role === 'edit';

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: 'Access denied: You have view-only permission for this workspace.' }, { status: 403 });
    }

    const updatedProj = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ project: { ...updatedProj, id: (updatedProj as any)._id } });
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
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }

    await Project.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
