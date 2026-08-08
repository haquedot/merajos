import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Settings from '../../../models/Settings';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.findById('user-settings').lean();
    if (!settings) {
      return NextResponse.json({ settings: null });
    }
    return NextResponse.json({ settings: { ...settings, id: settings._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const id = 'user-settings';
    
    const updatedSettings = await Settings.findByIdAndUpdate(
      id,
      { ...body, _id: id },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ settings: { ...updatedSettings, id: (updatedSettings as any)._id } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
