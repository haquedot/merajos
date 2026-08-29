import { AgentActionProposal } from '../types';

export function createProjectProposal(params: {
  title: string;
  description?: string;
  milestones?: string[];
}): AgentActionProposal {
  const { title, description = '', milestones = [] } = params;
  return {
    actionId: `act_proj_create_${Date.now()}`,
    module: 'projects',
    opType: 'CREATE',
    title: `Create Project: "${title}"`,
    description: `Create a new project with ${milestones.length} initial milestones`,
    targetData: { title, description, milestones },
    diffPreview: [
      { field: 'Project Title', before: 'None', after: title },
      { field: 'Milestones', before: '0 items', after: `${milestones.length} items` }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function toggleMilestoneProposal(params: {
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  completed: boolean;
}): AgentActionProposal {
  const { projectId, projectTitle, milestoneId, milestoneTitle, completed } = params;
  return {
    actionId: `act_proj_milestone_${Date.now()}`,
    module: 'projects',
    opType: 'UPDATE',
    entityId: projectId,
    title: `Project '${projectTitle}': ${completed ? 'Complete' : 'Reopen'} Milestone`,
    description: `Mark milestone '${milestoneTitle}' as ${completed ? 'Completed' : 'Pending'}`,
    targetData: { projectId, milestoneId, completed },
    diffPreview: [
      { field: `Milestone: ${milestoneTitle}`, before: completed ? 'Pending' : 'Completed', after: completed ? 'Completed' : 'Pending' }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function deleteProjectProposal(params: {
  projectId: string;
  projectTitle: string;
}): AgentActionProposal {
  const { projectId, projectTitle } = params;
  return {
    actionId: `act_proj_delete_${Date.now()}`,
    module: 'projects',
    opType: 'DELETE',
    entityId: projectId,
    title: `Delete Project: "${projectTitle}"`,
    description: `Permanently delete project '${projectTitle}' and its milestones`,
    targetData: { projectId },
    diffPreview: [
      { field: 'Status', before: 'Active', after: 'Deleted' }
    ],
    requiresConfirmation: true,
    status: 'pending'
  };
}
