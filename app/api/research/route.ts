import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Research from '../../../models/Research';

const DOC_ID = 'research-main';

export async function GET() {
  try {
    await connectToDatabase();
    const doc = await Research.findById(DOC_ID).lean();
    if (!doc) {
      return NextResponse.json({ projects: [] });
    }
    return NextResponse.json({ projects: (doc as any).projects ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { projects } = await req.json();

    const updated = await Research.findByIdAndUpdate(
      DOC_ID,
      { projects, _id: DOC_ID },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ projects: (updated as any)?.projects ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
