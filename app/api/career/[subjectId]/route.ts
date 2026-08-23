import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Career from '@/models/Career';
import { verifyAuth } from '@/lib/middleware/auth';
import { PRESET_SUBJECT_PLANS } from '@/lib/careerPresets';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await params;

    // Optional verification of requesting user session
    let userEmail: string | null = null;
    let userId: string | null = null;

    try {
      const auth = await verifyAuth(req);
      if (auth.authenticated) {
        userEmail = auth.user.userEmail?.toLowerCase().trim() || null;
        userId = auth.user.userId || null;
      }
    } catch {
      // Unauthenticated visitor
    }

    await connectToDatabase();

    // 1. Search for matching subject plan in MongoDB
    const careerDoc = await Career.findOne(
      { 'subjectPlans.id': subjectId },
      { 'subjectPlans.$': 1, userId: 1, userEmail: 1 }
    ).lean();

    if (careerDoc && careerDoc.subjectPlans && careerDoc.subjectPlans.length > 0) {
      const plan = careerDoc.subjectPlans[0] as any;
      const ownerEmail = (careerDoc as any).userEmail || plan.ownerEmail || '';
      const ownerId = (careerDoc as any).userId || '';

      const isOwner =
        (userId && ownerId === userId) ||
        (userEmail && ownerEmail.toLowerCase() === userEmail);

      const isPublic = Boolean(plan.isPublic);
      const sharedEmails: string[] = Array.isArray(plan.sharedWithEmails)
        ? plan.sharedWithEmails.map((e: string) => e.toLowerCase())
        : [];

      const isSharedWithUser = Boolean(
        userEmail && sharedEmails.includes(userEmail)
      );

      if (isOwner) {
        return NextResponse.json({
          plan: { ...plan, ownerEmail },
          access: 'owner',
          isOwner: true,
        });
      }

      if (isPublic || isSharedWithUser) {
        return NextResponse.json({
          plan: { ...plan, ownerEmail },
          access: 'view_only',
          isOwner: false,
          isPublic,
          isSharedWithUser,
        });
      }

      return NextResponse.json(
        {
          error: 'This subject plan is private. Ask the owner to share access with you.',
          isPrivate: true,
          planTitle: plan.title,
        },
        { status: 403 }
      );
    }

    // 2. Fallback to check preset plans (e.g. system roadmaps)
    const preset = PRESET_SUBJECT_PLANS.find((p: any) => p.id === subjectId);
    if (preset) {
      return NextResponse.json({
        plan: preset,
        access: 'view_only',
        isOwner: false,
        isPreset: true,
      });
    }

    return NextResponse.json({ error: 'Subject plan not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
