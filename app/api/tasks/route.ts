import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import { verifyAuth } from '../../../lib/middleware/auth';
import { deduplicateTasks } from '../../../lib/taskUtils';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const query = {
      $or: [
        { userId },
        { userEmail },
        { userId: { $exists: false } },
      ],
    };

    const tasks = await Task.find(query).sort({ createdAt: -1 }).lean();
    const { uniqueTasks: deduplicated, duplicateIds: duplicateIdsToDelete } = deduplicateTasks(tasks);

    const uniqueTasks = deduplicated.map((t) => ({ ...t, id: (t as any)._id || t.id }));

    if (duplicateIdsToDelete.length > 0) {
      Task.deleteMany({ _id: { $in: duplicateIdsToDelete } }).catch((err) =>
        console.warn('Failed to purge duplicate tasks from MongoDB', err)
      );
    }

    return NextResponse.json({ tasks: uniqueTasks });
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

    const items = Array.isArray(body) ? body : body.tasks ? body.tasks : null;

    if (items && Array.isArray(items)) {
      const { uniqueTasks: uniqueItems } = deduplicateTasks(items);

      const ops = uniqueItems.map((tsk: any) => {
        const id = tsk.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        return {
          updateOne: {
            filter: { _id: id },
            update: {
              $set: {
                ...tsk,
                _id: id,
                userId,
                userEmail,
              },
            },
            upsert: true,
          },
        };
      });

      if (ops.length > 0) {
        await Task.bulkWrite(ops);
      }
      return NextResponse.json({ success: true, count: uniqueItems.length }, { status: 201 });
    }

    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTask = await Task.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ task: { ...newTask, id: (newTask as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ task: { ...updatedTask, id: (updatedTask as any)._id } });
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
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }

    await Task.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
