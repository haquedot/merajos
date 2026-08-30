import Project from '../../../models/Project';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class ProjectsActionHandler implements ActionHandler {
  module = 'projects';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
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

    if (action.opType === 'UPDATE') {
      const featureTitle = String(action.targetData.featureTitle || action.targetData.title || action.targetData.name || action.title || 'New Feature').replace(/["']/g, '');
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

      const projectNameSearch = action.targetData.projectName ? String(action.targetData.projectName).replace(/["']/g, '').trim() : '';
      const query = projectNameSearch
        ? { userId, name: { $regex: projectNameSearch, $options: 'i' } }
        : { userId, status: 'active' };

      let project = await Project.findOne(query).sort({ updatedAt: -1 });
      if (project) {
        project.features.push(newFeature as any);
        await project.save();
        return project;
      }

      return await Project.create({
        _id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name: 'Main Project',
        clientName: 'Main Project',
        description: 'Default project created via Co-Pilot',
        status: 'active',
        features: [newFeature]
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
