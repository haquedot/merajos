import Career from '../../../models/Career';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class CareerActionHandler implements ActionHandler {
  module = 'career';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString();
    let career = await Career.findOne({ userId });

    if (!career) {
      career = await Career.create({
        _id: userId,
        userId,
        jobs: [],
        interviewTopics: [],
        dsaTopics: [],
        subjectPlans: []
      });
    }

    if (action.opType === 'CREATE') {
      const type = (action.targetData as any)?.type || (action.targetData as any)?.category || 'subject';

      if (type === 'job' || (action.targetData as any)?.company || (action.targetData as any)?.role) {
        const company = String((action.targetData as any)?.company || action.title || 'Company').replace(/["']/g, '');
        const role = String((action.targetData as any)?.role || 'Software Engineer').replace(/["']/g, '');
        const newJob = {
          id: `job_${Date.now()}`,
          company,
          role,
          appliedDate: todayStr.split('T')[0],
          status: (action.targetData as any)?.status || 'Applied',
          salary: (action.targetData as any)?.salary || '',
          location: (action.targetData as any)?.location || '',
          notes: (action.targetData as any)?.notes || 'Added via Co-Pilot'
        };

        career.jobs.push(newJob as any);
        await career.save();
        return career;
      }

      const planTitle = String((action.targetData as any)?.title || action.title || 'New Syllabus Plan').replace(/["']/g, '');
      const newPlan = {
        id: `subj_${Date.now()}`,
        title: planTitle,
        category: (action.targetData as any)?.category || 'General',
        description: (action.targetData as any)?.description || '',
        colorTheme: (action.targetData as any)?.colorTheme || '#1F3B99',
        topics: [],
        createdAt: todayStr,
        updatedAt: todayStr
      };

      career.subjectPlans.push(newPlan as any);
      await career.save();
      return career;
    }

    if (action.opType === 'UPDATE') {
      // 1. DSA Topic revision update
      if (action.entityId) {
        const dsaUpdated = await Career.findOneAndUpdate(
          { userId, 'dsaTopics.id': action.entityId },
          {
            $set: {
              'dsaTopics.$.lastRevised': todayStr,
              'dsaTopics.$.status': 'mastered'
            }
          },
          { new: true }
        );
        if (dsaUpdated) return dsaUpdated;
      }

      // 2. Job Application pipeline update
      const companySearch = (action.targetData as any)?.company ? String((action.targetData as any).company).replace(/["']/g, '').trim() : '';
      if (companySearch || (action.targetData as any)?.jobStatus) {
        const job = career.jobs.find((j: any) =>
          companySearch ? j.company.toLowerCase().includes(companySearch.toLowerCase()) : true
        );
        if (job) {
          job.status = (action.targetData as any)?.jobStatus || (action.targetData as any)?.status || job.status;
          await career.save();
          return career;
        }
      }

      // 3. General revision update
      return await Career.findOneAndUpdate(
        { userId },
        { $set: { updatedAt: todayStr } },
        { new: true, upsert: true }
      );
    }

    if (action.opType === 'DELETE') {
      const searchStr = String((action.targetData as any)?.title || (action.targetData as any)?.company || action.title || '').replace(/["']/g, '').trim();
      if (searchStr) {
        career.jobs = career.jobs.filter((j: any) => !j.company.toLowerCase().includes(searchStr.toLowerCase()));
        career.subjectPlans = career.subjectPlans.filter((p: any) => !p.title.toLowerCase().includes(searchStr.toLowerCase()));
        await career.save();
        return career;
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'career'`);
  }
}
