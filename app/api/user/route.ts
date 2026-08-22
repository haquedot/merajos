import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyAuth } from '../../../lib/middleware/auth';
import { UserUpdateSchema } from '../../../lib/validations/schemas';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const email = auth.user.userEmail;

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
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const body = await req.json();
    const email = auth.user.userEmail;
    const { name, picture, googleId } = body;

    const existingUser = await User.findOne({ email }).lean();
    const isAlreadyOnboarded = existingUser?.onboardingCompleted === true;

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: name || (existingUser as any)?.name || 'Orbit User',
          picture: picture || (existingUser as any)?.picture,
          googleId: googleId || (existingUser as any)?.googleId,
          lastLoginAt: new Date(),
          onboardingCompleted: isAlreadyOnboarded,
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
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const email = auth.user.userEmail;
    const body = await req.json();

    // Whitelist payload using UserUpdateSchema
    const parseResult = UserUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid user update payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parseResult.data;

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
