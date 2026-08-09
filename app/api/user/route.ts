import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ user: null, message: 'User not found' });
    }

    return NextResponse.json({ user: { ...user, id: (user as any)._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, name, picture, googleId, role, onboardingCompleted, enabledModules } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: name || 'Orbit User',
          picture,
          googleId,
          lastLoginAt: new Date(),
          ...(role && { role }),
          ...(onboardingCompleted !== undefined && { onboardingCompleted }),
          ...(enabledModules && { enabledModules }),
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ user: { ...user, id: (user as any)._id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { returnDocument: 'after' }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: { ...updatedUser, id: (updatedUser as any)._id } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
