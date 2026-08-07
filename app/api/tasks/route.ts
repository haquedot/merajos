import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import { initNodeCron } from '../../../lib/cron';

export async function GET() {
  try {
    initNodeCron();
    await connectToDatabase();
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();
    const formattedTasks = tasks.map((t: any) => ({ ...t, id: t._id }));
    return NextResponse.json({ tasks: formattedTasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newTask = await Task.create({
      ...body,
      _id: id,
    });

    const taskObj = newTask.toObject();
    return NextResponse.json({ task: { ...taskObj, id: taskObj._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: { ...updatedTask, id: (updatedTask as any)._id } });
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
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
