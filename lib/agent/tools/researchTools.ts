import { ResearchProject, ResearchPaper, ResearchSection } from '../../../types';
import { TaskProposal } from '../types';

export interface ResearchExtractionResult {
  paperReadingProposals: TaskProposal[];
  sectionWritingProposals: TaskProposal[];
}

export function extractResearchTaskCandidates(projects: ResearchProject[] = []): ResearchExtractionResult {
  const paperReadingProposals: TaskProposal[] = [];
  const sectionWritingProposals: TaskProposal[] = [];

  projects.forEach((project) => {
    if (project.status === 'completed') return;

    project.sections?.forEach((section: ResearchSection) => {
      // 1. Process Unread or Important Papers in section
      section.papers?.forEach((paper: ResearchPaper) => {
        if (paper.status === 'unread' || paper.isImportant) {
          const isPriority = paper.isImportant || paper.status === 'reading';
          paperReadingProposals.push({
            title: `Research Reading: ${paper.title} (${paper.year || 'Paper'})`,
            category: 'Research',
            estimatedHours: paper.readingTimeMinutes ? paper.readingTimeMinutes / 60 : 0.75, // default 45 mins
            priority: isPriority ? 'high' : 'medium',
            mit: isPriority && paper.isImportant,
            timeSlot: 'afternoon', // Afternoon slot preference for reading
            reason: `Academic paper '${paper.title}' in project '${project.title}' is ${paper.status}`,
            sourceModule: 'research',
            sourceEntityId: paper.id
          });
        }
      });

      // 2. Process Section Writing Gaps
      if (section.targetWords && section.currentWords !== undefined) {
        const gapWords = section.targetWords - section.currentWords;
        if (gapWords > 0 && section.writingStatus !== 'completed') {
          const estimatedHours = Math.min(2.0, Math.max(0.5, Math.round((gapWords / 300) * 10) / 10)); // ~300 words/hour

          sectionWritingProposals.push({
            title: `Thesis Writing: ${project.title} - ${section.title} (${gapWords} words remaining)`,
            category: 'Research',
            estimatedHours,
            priority: gapWords > 1000 ? 'high' : 'medium',
            mit: gapWords > 1500,
            timeSlot: 'afternoon',
            reason: `Writing section '${section.title}' needs ${gapWords} more words to reach target (${section.currentWords}/${section.targetWords})`,
            sourceModule: 'research',
            sourceEntityId: section.id
          });
        }
      }
    });
  });

  return {
    paperReadingProposals,
    sectionWritingProposals
  };
}
