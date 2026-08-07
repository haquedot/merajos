import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Research from '../../../models/Research';

export async function GET() {
  try {
    await connectToDatabase();
    const research = await Research.findById('research-main').lean();
    if (!research) {
      return NextResponse.json({ research: null });
    }
    return NextResponse.json({ research });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = 'research-main';
    
    const updated = await Research.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ research: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
