import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import SavedLink from '../../../models/Link';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const links = await SavedLink.find({
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = links.map((link: any) => ({ ...link, id: link._id }));
    return NextResponse.json({ links: formatted });
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
    const id = body.id || `link-${Date.now()}`;

    const newLink = await SavedLink.findOneAndUpdate(
      { _id: id },
      { ...body, _id: id, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ link: { ...newLink, id: (newLink as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Link id is required' }, { status: 400 });
    }

    const updatedLink = await SavedLink.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userEmail }, { userId: { $exists: false } }] },
      { $set: { ...updates, userId, userEmail, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedLink) {
      return NextResponse.json({ error: 'Link not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ link: { ...updatedLink, id: (updatedLink as any)._id } });
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
      return NextResponse.json({ error: 'Link id is required' }, { status: 400 });
    }

    await SavedLink.findOneAndDelete({
      _id: id,
      $or: [{ userId }, { userEmail }, { userId: { $exists: false } }],
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
