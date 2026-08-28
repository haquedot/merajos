import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Career from '../../../models/Career';
import { verifyAuth } from '../../../lib/middleware/auth';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    await connectToDatabase();
    const userId = auth.user.userId;
    const userEmail = auth.user.userEmail;
    const docId = `career-${userId}`;

    let career = await Career.findOne({
      $or: [
        { _id: docId },
        { userId },
        { userEmail },
        { _id: 'career-me' },
        { _id: 'career-main' },
      ],
    }).lean();

    if (!career) {
      career = await Career.findOne({}).lean();
    }

    if (!career) {
      return NextResponse.json({ career: null });
    }
    return NextResponse.json({ career: { ...career, id: (career as any)._id } });
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
    const docId = `career-${userId}`;

    let existingDoc = await Career.findOne({
      $or: [
        { _id: docId },
        { userId },
        { userEmail },
        { _id: 'career-me' },
        { _id: 'career-main' },
      ],
    }).lean();

    if (!existingDoc) {
      existingDoc = await Career.findOne({}).lean();
    }

    const targetDocId = existingDoc ? (existingDoc as any)._id : docId;

    // Prevent unhydrated empty arrays from wiping existing non-empty DB collections
    const payload = { ...body };
    if (existingDoc) {
      const doc = existingDoc as any;
      if (Array.isArray(doc.jobs) && doc.jobs.length > 0 && Array.isArray(body.jobs) && body.jobs.length === 0) {
        payload.jobs = doc.jobs;
      }
      if (Array.isArray(doc.interviewTopics) && doc.interviewTopics.length > 0 && Array.isArray(body.interviewTopics) && body.interviewTopics.length === 0) {
        payload.interviewTopics = doc.interviewTopics;
      }
      if (Array.isArray(doc.dsaTopics) && doc.dsaTopics.length > 0 && Array.isArray(body.dsaTopics) && body.dsaTopics.length === 0) {
        payload.dsaTopics = doc.dsaTopics;
      }
      if (Array.isArray(doc.subjectPlans) && doc.subjectPlans.length > 0 && Array.isArray(body.subjectPlans) && body.subjectPlans.length === 0) {
        payload.subjectPlans = doc.subjectPlans;
      }
    }

    const updated = await Career.findOneAndUpdate(
      { _id: targetDocId },
      { ...payload, _id: targetDocId, userId, userEmail },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ career: { ...updated, id: (updated as any)._id } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
