import { AgentActionProposal } from '../types';

export interface ActionHandler {
  module: string;
  execute(action: AgentActionProposal, userId: string): Promise<unknown>;
}
