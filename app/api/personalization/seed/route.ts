import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import UserPreferencesModel from '../../../../models/UserPreferences';
import DerivedSignalModel from '../../../../models/DerivedSignal';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const sampleUserId = '6a84690dd0d07ce2d71b0c47';
    const sampleEmail = 'haquedot@gmail.com';

    // 1. Upsert UserPreferences
    const preferences = await UserPreferencesModel.findOneAndUpdate(
      { userId: sampleUserId },
      {
        userId: sampleUserId,
        userEmail: sampleEmail,
        targetRole: 'Senior Full-Stack Architect',
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
      },
      { upsert: true, new: true }
    );

    // 2. Upsert Derived Signals
    const signals = [
      {
        userId: sampleUserId,
        signalKey: 'career_morning_completion_affinity',
        category: 'Career',
        timeSlot: 'morning',
        value: 0.88,
        sampleSize: 28,
        confidence: 0.92,
        lastObservedAt: new Date(),
        observationWindowDays: 30,
        recencyWeight: 1.0,
        baseline: 0.5,
      },
      {
        userId: sampleUserId,
        signalKey: 'research_afternoon_completion_affinity',
        category: 'Research',
        timeSlot: 'afternoon',
        value: 0.79,
        sampleSize: 18,
        confidence: 0.84,
        lastObservedAt: new Date(),
        observationWindowDays: 30,
        recencyWeight: 0.95,
        baseline: 0.5,
      },
      {
        userId: sampleUserId,
        signalKey: 'client_morning_completion_affinity',
        category: 'Client',
        timeSlot: 'morning',
        value: 0.91,
        sampleSize: 34,
        confidence: 0.95,
        lastObservedAt: new Date(),
        observationWindowDays: 30,
        recencyWeight: 1.0,
        baseline: 0.5,
      },
    ];

    for (const sig of signals) {
      await DerivedSignalModel.findOneAndUpdate(
        { userId: sampleUserId, signalKey: sig.signalKey },
        sig,
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded test personalization preferences & derived signals!',
      preferences,
      signalCount: signals.length,
    });
  } catch (error: any) {
    console.error('Error seeding test personalization data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed test data' },
      { status: 500 }
    );
  }
}
