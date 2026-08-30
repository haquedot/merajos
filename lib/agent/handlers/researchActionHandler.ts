import Research from '../../../models/Research';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class ResearchActionHandler implements ActionHandler {
  module = 'research';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const todayStr = new Date().toISOString();
    let researchDoc = await Research.findOne({ _id: userId });

    if (!researchDoc) {
      researchDoc = await Research.create({
        _id: userId,
        projects: [
          {
            id: `proj_${Date.now()}`,
            title: 'General Research',
            status: 'active',
            progress: 0,
            color: '#3b82f6',
            sections: [
              {
                id: 'sec_1',
                type: 'literature_review',
                title: 'Literature Review',
                papers: [],
                createdAt: todayStr,
                order: 0
              }
            ],
            createdAt: todayStr,
            updatedAt: todayStr
          }
        ]
      });
    }

    if (action.opType === 'CREATE') {
      const isProject = (action.targetData as any)?.type === 'project' || lowerIncludes(action, 'create project');

      if (isProject) {
        const projectTitle = String((action.targetData as any)?.title || action.title || 'New Research Project').replace(/["']/g, '');
        const newProj = {
          id: `proj_${Date.now()}`,
          title: projectTitle,
          field: (action.targetData as any)?.field || 'Computer Science',
          status: 'active',
          progress: 0,
          color: '#3b82f6',
          sections: [
            {
              id: `sec_${Date.now()}`,
              type: 'literature_review',
              title: 'Literature Review',
              papers: [],
              createdAt: todayStr,
              order: 0
            }
          ],
          createdAt: todayStr,
          updatedAt: todayStr
        };
        researchDoc.projects.push(newProj as any);
        await researchDoc.save();
        return researchDoc;
      }

      // Default: Create literature paper
      const paperTitle = String((action.targetData as any)?.paperTitle || (action.targetData as any)?.title || action.title || 'Untitled Paper').replace(/["']/g, '');
      const newPaper = {
        id: `paper_${Date.now()}`,
        title: paperTitle,
        authors: (action.targetData as any)?.authors || 'Unknown',
        year: (action.targetData as any)?.year || new Date().getFullYear(),
        status: (action.targetData as any)?.paperStatus || 'unread',
        isImportant: true,
        summary: (action.targetData as any)?.summary || '',
        citation: (action.targetData as any)?.citation || '',
        addedAt: todayStr
      };

      let targetSec = researchDoc.projects[0]?.sections.find((s: any) => s.type === 'literature_review');
      if (!targetSec && researchDoc.projects[0]) {
        targetSec = {
          id: `sec_${Date.now()}`,
          type: 'literature_review',
          title: 'Literature Review',
          papers: [newPaper],
          createdAt: todayStr,
          order: 0
        };
        researchDoc.projects[0].sections.push(targetSec as any);
      } else if (targetSec) {
        targetSec.papers.push(newPaper as any);
      }

      await researchDoc.save();
      return researchDoc;
    }

    if (action.opType === 'UPDATE') {
      const searchTitle = String((action.targetData as any)?.paperTitle || (action.targetData as any)?.title || action.title || '').replace(/["']/g, '').trim();
      const newStatus = (action.targetData as any)?.paperStatus || (action.targetData as any)?.status;

      let paperFound = false;
      for (const proj of researchDoc.projects) {
        for (const sec of proj.sections) {
          if (sec.papers) {
            const p = sec.papers.find((paper: any) =>
              action.entityId ? paper.id === action.entityId : searchTitle ? paper.title.toLowerCase().includes(searchTitle.toLowerCase()) : false
            );
            if (p) {
              if (newStatus) p.status = newStatus;
              if ((action.targetData as any)?.isImportant !== undefined) p.isImportant = (action.targetData as any).isImportant;
              if ((action.targetData as any)?.summary) p.summary = (action.targetData as any).summary;
              paperFound = true;
              break;
            }
          }
          if (sec.type === 'writing' && (action.targetData as any)?.currentWords !== undefined) {
            sec.currentWords = (action.targetData as any).currentWords;
          }
        }
        if (paperFound) break;
      }

      await researchDoc.save();
      return researchDoc;
    }

    if (action.opType === 'DELETE') {
      const searchTitle = String((action.targetData as any)?.paperTitle || (action.targetData as any)?.title || action.title || '').replace(/["']/g, '').trim();
      if (searchTitle) {
        for (const proj of researchDoc.projects) {
          for (const sec of proj.sections) {
            if (sec.papers) {
              sec.papers = sec.papers.filter((p: any) => !p.title.toLowerCase().includes(searchTitle.toLowerCase()));
            }
          }
        }
        await researchDoc.save();
        return researchDoc;
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'research'`);
  }
}

function lowerIncludes(action: AgentActionProposal, phrase: string): boolean {
  return String((action.targetData as any)?.prompt || action.title || '').toLowerCase().includes(phrase);
}
