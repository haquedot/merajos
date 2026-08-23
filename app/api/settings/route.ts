import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Settings from '../../../models/Settings';
import User from '../../../models/User';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const docId = `settings-${userId}`;

    let settings: any = await Settings.findOne({
      $or: [{ _id: docId }, { userId }, { userEmail }, { _id: 'user-settings' }],
    }).lean();

    // Check User model for authoritative onboarding & enabledModules
    const dbUser: any = await User.findOne({ email: userEmail }).lean();

    if (!settings && !dbUser) {
      return NextResponse.json({ settings: null });
    }

    if (!settings) {
      settings = {
        _id: docId,
        userId,
        userEmail,
        onboarding: {
          displayName: dbUser?.name || 'User',
          role: dbUser?.role || 'custom',
          enabledModules: dbUser?.enabledModules || [],
          workStartTime: dbUser?.workStartTime || '09:00',
          workEndTime: dbUser?.workEndTime || '18:00',
          primaryGoal: '',
          onboardingCompleted: !!dbUser?.onboardingCompleted,
        },
      };
    } else if (dbUser && dbUser.enabledModules && dbUser.enabledModules.length > 0) {
      // Merge enabledModules from User model if settings lacks them or has empty array
      const currentModules = settings.onboarding?.enabledModules || [];
      if (currentModules.length === 0) {
        settings = {
          ...settings,
          onboarding: {
            ...settings.onboarding,
            enabledModules: dbUser.enabledModules,
            role: dbUser.role || settings.onboarding?.role,
            workStartTime: dbUser.workStartTime || settings.onboarding?.workStartTime,
            workEndTime: dbUser.workEndTime || settings.onboarding?.workEndTime,
            onboardingCompleted: dbUser.onboardingCompleted ?? settings.onboarding?.onboardingCompleted,
          },
        };
      }
    }

    return NextResponse.json({ settings: { ...settings, id: settings._id } });
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
    const docId = `settings-${userId}`;

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: docId },
      { ...body, _id: docId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    // Also sync to User model
    if (body.onboarding) {
      await User.findOneAndUpdate(
        { email: userEmail },
        {
          $set: {
            ...(body.onboarding.enabledModules && { enabledModules: body.onboarding.enabledModules }),
            ...(body.onboarding.role && { role: body.onboarding.role }),
            ...(body.onboarding.workStartTime && { workStartTime: body.onboarding.workStartTime }),
            ...(body.onboarding.workEndTime && { workEndTime: body.onboarding.workEndTime }),
            ...(body.onboarding.onboardingCompleted !== undefined && { onboardingCompleted: body.onboarding.onboardingCompleted }),
          },
        }
      ).catch(() => {});
    }

    return NextResponse.json({ settings: { ...updatedSettings, id: (updatedSettings as any)._id } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

