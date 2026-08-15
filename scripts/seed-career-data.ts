import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env / .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import Career from '../models/Career';
import { SOFTWARE_ENGINEER_SEED_DATA } from '../lib/softwareEngineerSeed';

async function seedCareerData() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    const careerId = 'career-main';

    console.log('🌱 Seeding Software Engineer Career Data into MongoDB...');

    const updated = await Career.findByIdAndUpdate(
      careerId,
      {
        _id: careerId,
        subjectPlans: SOFTWARE_ENGINEER_SEED_DATA.subjectPlans,
        dsaTopics: SOFTWARE_ENGINEER_SEED_DATA.dsaTopics,
        interviewTopics: SOFTWARE_ENGINEER_SEED_DATA.interviewTopics,
        jobs: SOFTWARE_ENGINEER_SEED_DATA.jobs,
      },
      { upsert: true, new: true }
    );

    console.log('🎉 Successfully seeded Software Engineer Career Data!');
    console.log(`- Subject Plans: ${updated.subjectPlans.length}`);
    console.log(`- DSA Topics: ${updated.dsaTopics.length}`);
    console.log(`- Interview Categories: ${updated.interviewTopics.length}`);
    console.log(`- Job Applications: ${updated.jobs.length}`);

    await mongoose.disconnect();
    console.log('👋 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding career data:', error);
    process.exit(1);
  }
}

seedCareerData();
