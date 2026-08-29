import { extractCareerTaskCandidates } from '../tools/careerTools';
import { DSATopic, SubjectPlan, JobApplication } from '../../../types';
import { TaskProposal } from '../types';

export class CareerAgent {
  name = 'CareerAndDSAAgent';

  public process(params: {
    dsaTopics?: DSATopic[];
    subjectPlans?: SubjectPlan[];
    jobs?: JobApplication[];
  }): { proposals: TaskProposal[]; logMessage: string } {
    const extracted = extractCareerTaskCandidates(params);

    // Prioritize: Job Followups > Urgent DSA > In Progress Subjects > General DSA
    const combinedProposals = [
      ...extracted.jobFollowupProposals,
      ...extracted.subjectTaskProposals.filter((p) => p.priority === 'high' || p.mit),
      ...extracted.dsaTaskProposals.slice(0, 2), // Top 2 stale DSA topics max
      ...extracted.subjectTaskProposals.filter((p) => p.priority !== 'high' && !p.mit).slice(0, 2)
    ];

    const logMessage = `Scanned ${params.dsaTopics?.length || 0} DSA topics, ${params.subjectPlans?.length || 0} subject plans, and ${params.jobs?.length || 0} job pipelines. Extracted ${combinedProposals.length} high-impact career tasks.`;

    return {
      proposals: combinedProposals,
      logMessage
    };
  }
}
