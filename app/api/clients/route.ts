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

    const projects = await Project.find({
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = projects.map((p: any) => ({ ...p, id: p._id }));
    return NextResponse.json({ projects: formatted, clients: formatted });
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
      return NextResponse.json({ error: 'Project/Client id is required' }, { status: 400 });
    }

    const updatedProj = await Project.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedProj) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

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
