import { AgentActionProposal } from '../types';

export function createNoteProposal(params: {
  title: string;
  content?: string;
  tags?: string[];
  folder?: string;
}): AgentActionProposal {
  const { title, content = '', tags = ['co-pilot'], folder = 'General' } = params;
  return {
    actionId: `act_note_create_${Date.now()}`,
    module: 'notes',
    opType: 'CREATE',
    title: `Create Note: "${title}"`,
    description: `Create a new note in folder '${folder}' with tags: [${tags.join(', ')}]`,
    targetData: { title, content, tags, folder },
    diffPreview: [
      { field: 'Title', before: 'None', after: title },
      { field: 'Folder', before: 'None', after: folder },
      { field: 'Tags', before: 'None', after: tags.join(', ') }
    ],
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function updateNoteProposal(params: {
  noteId: string;
  noteTitle: string;
  updates: {
    content?: string;
    pinned?: boolean;
    tags?: string[];
  };
}): AgentActionProposal {
  const { noteId, noteTitle, updates } = params;
  const diffs = Object.entries(updates).map(([key, val]) => ({
    field: key,
    before: 'Current Value',
    after: val
  }));

  return {
    actionId: `act_note_update_${Date.now()}`,
    module: 'notes',
    opType: 'UPDATE',
    entityId: noteId,
    title: `Update Note: "${noteTitle}"`,
    description: `Apply updates to note '${noteTitle}'`,
    targetData: { noteId, updates },
    diffPreview: diffs,
    requiresConfirmation: false,
    status: 'pending'
  };
}

export function deleteNoteProposal(params: {
  noteId: string;
  noteTitle: string;
}): AgentActionProposal {
  const { noteId, noteTitle } = params;
  return {
    actionId: `act_note_delete_${Date.now()}`,
    module: 'notes',
    opType: 'DELETE',
    entityId: noteId,
    title: `Delete Note: "${noteTitle}"`,
    description: `Permanently delete note '${noteTitle}'`,
    targetData: { noteId },
    diffPreview: [
      { field: 'Status', before: 'Active', after: 'Deleted' }
    ],
    requiresConfirmation: true,
    status: 'pending'
  };
}
