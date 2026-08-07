import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Career from '../../../models/Career';

export async function GET() {
  try {
    await connectToDatabase();
    const career = await Career.findById('career-main').lean();
    if (!career) {
      return NextResponse.json({ career: null });
    }
    return NextResponse.json({ career });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = 'career-main';
    
    const updated = await Career.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ career: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
