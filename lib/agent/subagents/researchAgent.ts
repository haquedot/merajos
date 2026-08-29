import { extractResearchTaskCandidates } from '../tools/researchTools';
import { ResearchProject } from '../../../types';
import { TaskProposal } from '../types';

export class ResearchAgent {
  name = 'ResearchSynthesizerAgent';

  public process(projects: ResearchProject[] = []): { proposals: TaskProposal[]; logMessage: string } {
    const extracted = extractResearchTaskCandidates(projects);

    // Prioritize: Important paper reading > Writing section targets > Standard paper reading
    const combinedProposals = [
      ...extracted.paperReadingProposals.filter((p) => p.mit || p.priority === 'high'),
      ...extracted.sectionWritingProposals.slice(0, 2),
      ...extracted.paperReadingProposals.filter((p) => !p.mit && p.priority !== 'high').slice(0, 2)
    ];

    const totalPapers = projects.reduce(
      (acc, proj) => acc + (proj.sections?.reduce((sAcc, s) => sAcc + (s.papers?.length || 0), 0) || 0),
      0
    );

    const logMessage = `Scanned ${projects.length} research projects and ${totalPapers} papers. Extracted ${combinedProposals.length} high-priority reading/writing tasks.`;

    return {
      proposals: combinedProposals,
      logMessage
    };
  }
}
