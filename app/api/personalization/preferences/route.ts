import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import UserPreferences from '../../../../models/UserPreferences';
import { verifyAuth } from '../../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    let preferences = await UserPreferences.findOne({
      $or: [{ userId }, { userEmail }],
    }).lean();

    if (!preferences) {
      // Create default preferences document
      preferences = await UserPreferences.create({
        userId,
        userEmail,
        targetRole: 'Software Engineer',
        preferredFocusDurationMinutes: 45,
        maxDailyMITs: 3,
        dailyCapacityHours: 7.0,
        personalizationEnabled: true,
        learnFromTaskBehavior: true,
        learnFromFocusSessions: true,
        learnFromHabits: true,
        categorySlotAffinity: {
          Career: 'morning',
          Research: 'afternoon',
          Client: 'morning',
          Personal: 'evening',
          College: 'morning',
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;

    const body = await req.json();

    const updated = await UserPreferences.findOneAndUpdate(
      { $or: [{ userId }, { userEmail }] },
      { $set: { ...body, userId, userEmail } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({ preferences: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}
