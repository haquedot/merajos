import { DSATopic, SubjectPlan, JobApplication } from '../../../types';
import { TaskProposal } from '../types';

export interface CareerExtractionResult {
  dsaTaskProposals: TaskProposal[];
  subjectTaskProposals: TaskProposal[];
  jobFollowupProposals: TaskProposal[];
}

export function extractCareerTaskCandidates(params: {
  dsaTopics?: DSATopic[];
  subjectPlans?: SubjectPlan[];
  jobs?: JobApplication[];
}): CareerExtractionResult {
  const { dsaTopics = [], subjectPlans = [], jobs = [] } = params;

  const dsaTaskProposals: TaskProposal[] = [];
  const subjectTaskProposals: TaskProposal[] = [];
  const jobFollowupProposals: TaskProposal[] = [];

  const now = Date.now();

  // 1. Process DSA Topics needing revision or unmastered
  dsaTopics.forEach((topic) => {
    const daysSinceRevised = topic.lastRevised
      ? (now - new Date(topic.lastRevised).getTime()) / (1000 * 3600 * 24)
      : 30; // default 30 days if never revised

    const remainingMediumHard = (topic.mediumTotal - topic.mediumSolved) + (topic.hardTotal - topic.hardSolved);

    if (daysSinceRevised >= 5 || remainingMediumHard > 0) {
      dsaTaskProposals.push({
        title: `DSA Practice: ${topic.name} (${topic.mediumSolved}/${topic.mediumTotal} Med, ${topic.hardSolved}/${topic.hardTotal} Hard)`,
        category: 'Career',
        estimatedHours: 0.75, // 45 mins
        priority: daysSinceRevised > 10 ? 'high' : 'medium',
        mit: daysSinceRevised > 14,
        timeSlot: 'morning', // Morning preference for peak focus
        reason: `DSA topic '${topic.name}' requires practice (Last revised: ${Math.round(daysSinceRevised)}d ago)`,
        sourceModule: 'career',
        sourceEntityId: topic.id
      });
    }
  });

  // 2. Process Subject Plans with unmastered topics or incomplete checklists
  subjectPlans.forEach((plan) => {
    plan.topics.forEach((subTopic) => {
      if (subTopic.status !== 'mastered') {
        const incompleteChecklist = subTopic.checklist.filter((item) => !item.completed);
        const checklistDetail = incompleteChecklist.length > 0 ? ` (${incompleteChecklist.length} sub-items pending)` : '';

        subjectTaskProposals.push({
          title: `${plan.title}: ${subTopic.title}${checklistDetail}`,
          category: 'Career',
          estimatedHours: subTopic.difficulty === 'Advanced' ? 1.0 : 0.5,
          priority: subTopic.status === 'in_progress' ? 'high' : 'medium',
          mit: subTopic.status === 'in_progress' && subTopic.difficulty === 'Advanced',
          timeSlot: 'morning',
          reason: `Subject module '${plan.title}' topic '${subTopic.title}' is ${subTopic.status.replace('_', ' ')}`,
          sourceModule: 'career',
          sourceEntityId: subTopic.id
        });
      }
    });
  });

  // 3. Process Job Applications in OA or Interview stage needing prep
  jobs.forEach((job) => {
    if (job.status === 'OA' || job.status === 'Interview') {
      jobFollowupProposals.push({
        title: `Interview Prep: ${job.company} - ${job.role} (${job.status} Stage)`,
        category: 'Career',
        estimatedHours: 1.0,
        priority: 'urgent',
        mit: true,
        timeSlot: 'morning',
        reason: `Active job opportunity at ${job.company} in ${job.status} stage`,
        sourceModule: 'career',
        sourceEntityId: job.id
      });
    }
  });

  return {
    dsaTaskProposals,
    subjectTaskProposals,
    jobFollowupProposals
  };
}
