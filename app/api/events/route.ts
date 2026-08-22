import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import CalendarEvent from '../../../models/CalendarEvent';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const events = await CalendarEvent.find({
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    })
      .sort({ startDate: 1 })
      .lean();

    const formatted = events.map((e: any) => ({ ...e, id: e._id }));
    return NextResponse.json({ events: formatted });
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

    const items = Array.isArray(body) ? body : body.events ? body.events : null;

    if (items && Array.isArray(items)) {
      const ops = items.map((evt: any) => {
        const id = evt.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { ...evt, _id: id, userId, userEmail } },
            upsert: true,
          },
        };
      });

      if (ops.length > 0) {
        await CalendarEvent.bulkWrite(ops);
      }
      return NextResponse.json({ success: true, count: items.length }, { status: 201 });
    }

    const id = body.id || `evt-${Date.now()}`;
    const newEvt = await CalendarEvent.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ event: { ...newEvt, id: (newEvt as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const updatedEvt = await CalendarEvent.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedEvt) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ event: { ...updatedEvt, id: (updatedEvt as any)._id } });
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
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    await CalendarEvent.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
