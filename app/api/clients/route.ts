import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Project from '../../../models/Project';

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    const formatted = projects.map((p: any) => ({ ...p, id: p._id }));
    return NextResponse.json({ projects: formatted, clients: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `proj-${Date.now()}`;
    
    const newProj = await Project.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, returnDocument: 'after', runValidators: false }
    ).lean();

    return NextResponse.json({ project: { ...newProj, id: (newProj as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Project/Client id is required' }, { status: 400 });
    }

    const updatedProj = await Project.findByIdAndUpdate(id, updates, { returnDocument: 'after' }).lean();
    if (!updatedProj) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project: { ...updatedProj, id: (updatedProj as any)._id } });
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
      return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
    }

    await Project.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
