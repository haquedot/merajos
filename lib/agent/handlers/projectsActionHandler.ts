import Project from '../../../models/Project';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class ProjectsActionHandler implements ActionHandler {
  module = 'projects';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    const promptStr = String(action.targetData.prompt || action.title || '');
    const promptLower = promptStr.toLowerCase();

    const isFeatureOrBug =
      action.targetData.type === 'feature' ||
      action.targetData.type === 'bug' ||
      !!action.targetData.featureTitle ||
      promptLower.includes('feature') ||
      promptLower.includes('deliverable') ||
      promptLower.includes('bug') ||
      (promptLower.includes('module') && !promptLower.startsWith('create project') && !promptLower.startsWith('new project'));

    const isExplicitNewProject =
      promptLower.startsWith('create project') ||
      promptLower.startsWith('add project') ||
      promptLower.startsWith('new project') ||
      promptLower.startsWith('create a project') ||
      promptLower.startsWith('create a new project') ||
      promptLower.startsWith('create client') ||
      promptLower.startsWith('add client');

    // If request is to add a feature/deliverable/bug OR opType is UPDATE
    if (action.opType === 'UPDATE' || (isFeatureOrBug && !isExplicitNewProject && action.opType !== 'DELETE')) {
      const { projectNameSearch, featureTitle } = extractProjectAndFeature(action);

      const newFeature = {
        id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: featureTitle,
        description: String(action.targetData.description || `Feature "${featureTitle}" requested via Co-Pilot`),
        completed: false,
        priority: action.targetData.priority || 'medium',
        createdAt: new Date().toISOString()
      };

      if (action.entityId) {
        return await Project.findOneAndUpdate(
          { _id: action.entityId, userId },
          { $push: { features: newFeature } },
          { new: true }
        );
      }

      const query = projectNameSearch
        ? { userId, name: { $regex: projectNameSearch, $options: 'i' } }
        : { userId, status: 'active' };

      let project = await Project.findOne(query).sort({ updatedAt: -1 });

      if (!project && projectNameSearch) {
        // Fallback search: look for any project belonging to the user
        project = await Project.findOne({ userId }).sort({ updatedAt: -1 });
      }

      if (project) {
        project.features.push(newFeature as any);
        await project.save();
        return project;
      }

      // If no project exists at all, create a project with the feature inside it
      const targetProjName = projectNameSearch || 'Main Project';
      return await Project.create({
        _id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name: targetProjName,
        clientName: targetProjName,
        description: `Project "${targetProjName}" created via Co-Pilot`,
        status: 'active',
        features: [newFeature]
      });
    }

    // Default: Handle Project creation
    if (action.opType === 'CREATE') {
      const projectTitle = String(action.targetData.title || action.targetData.name || action.title || 'New Project').replace(/["']/g, '');
      return await Project.create({
        _id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name: projectTitle,
        clientName: projectTitle,
        description: String(action.targetData.description || `Project/Client "${projectTitle}"`),
        status: 'active',
        progress: 0,
        color: '#6366f1'
      });
    }

    if (action.opType === 'DELETE') {
      if (action.entityId) {
        return await Project.findOneAndDelete({ _id: action.entityId, userId });
      }
      const rawTarget = String(action.targetData?.title || action.targetData?.name || action.targetData?.prompt || '');
      const cleanTitle = rawTarget.replace(/["']/g, '').replace(/^(delete|remove)\s+(project|client)?\s*/i, '').trim();
      if (cleanTitle) {
        return await Project.deleteMany({
          userId,
          name: { $regex: cleanTitle, $options: 'i' }
        });
      }
      return null;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'projects'`);
  }
}

function extractProjectAndFeature(action: AgentActionProposal) {
  const promptStr = String(action.targetData.prompt || action.title || '');

  // Extract explicit projectNameSearch
  let projectNameSearch = String(
    action.targetData.projectName ||
    action.targetData.name ||
    ''
  ).replace(/["']/g, '').trim();

  const projMatch = promptStr.match(/(?:in|for|to)\s+(?:the\s+)?project\s+["']?([^"',.]+)/i);
  if (projMatch) {
    projectNameSearch = projMatch[1].trim();
  }

  // Extract feature title
  let featureTitle = String(
    action.targetData.featureTitle ||
    action.targetData.title ||
    action.title ||
    'New Feature'
  ).replace(/["']/g, '').trim();

  // If feature title matches project name, extract non-project title from quotes or prompt
  if (projectNameSearch && featureTitle.toLowerCase() === projectNameSearch.toLowerCase()) {
    const quoteMatches = Array.from(promptStr.matchAll(/["']([^"']+)["']/g)).map((m) => m[1].trim());
    const nonProjQuote = quoteMatches.find((q) => q.toLowerCase() !== projectNameSearch.toLowerCase());
    if (nonProjQuote) {
      featureTitle = nonProjQuote;
    } else {
      const cleaned = promptStr
        .replace(/(?:in|for|to)\s+(?:the\s+)?project\s+["']?([^"',.]+)/i, '')
        .replace(/^(create|add|new)\s+(a\s+)?(new\s+)?(feature|deliverable|bug|module)\s*(titled|named|called)?\s*/i, '')
        .replace(/["']/g, '')
        .trim();
      if (cleaned) featureTitle = cleaned;
    }
  }

  return { projectNameSearch, featureTitle };
}
