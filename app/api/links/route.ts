import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import SavedLink from '../../../models/Link';

export async function GET() {
  try {
    await connectToDatabase();
    const links = await SavedLink.find({}).sort({ createdAt: -1 }).lean();
    const formatted = links.map((link: any) => ({ ...link, id: link._id }));
    return NextResponse.json({ links: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = body.id || `link-${Date.now()}`;

    const newLink = await SavedLink.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ link: { ...newLink, id: (newLink as any)._id } }, { status: 201 });
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
      return NextResponse.json({ error: 'Link id is required' }, { status: 400 });
    }

    const updatedLink = await SavedLink.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date().toISOString() },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ link: { ...updatedLink, id: (updatedLink as any)._id } });
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
      return NextResponse.json({ error: 'Link id is required' }, { status: 400 });
    }

    await SavedLink.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
