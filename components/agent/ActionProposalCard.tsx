import React, { useState } from 'react';
import { AgentActionProposal } from '../../lib/agent/types';
import { Check, Trash2, ArrowRight, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '../../lib/authCheck';

interface ActionProposalCardProps {
  proposal: AgentActionProposal;
  onExecuted?: (actionId: string) => void;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({ proposal, onExecuted }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(proposal.status === 'executed');

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/execute-action', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionProposal: proposal })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setExecuted(true);
        toast.success(`Executed: ${proposal.title}`);
        if (onExecuted) onExecuted(proposal.actionId);
      } else {
        toast.error(data.error || 'Failed to execute proposal');
      }
    } catch (err: any) {
      toast.error(`Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getOpBadge = () => {
    switch (proposal.opType) {
      case 'CREATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">ACTION</span>;
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      executed
        ? 'bg-emerald-950/10 border-emerald-500/30'
        : proposal.opType === 'DELETE'
        ? 'bg-rose-950/10 border-rose-500/30'
        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-mono tracking-wider uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {proposal.module}
          </span>
          {getOpBadge()}
        </div>

        {executed ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" /> Executed
          </span>
        ) : (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
              proposal.opType === 'DELETE'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            } disabled:opacity-50`}
          >
            {isExecuting ? (
              'Executing...'
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Approve & Execute
              </>
            )}
          </button>
        )}
      </div>

      <h4 className="text-sm font-semibold text-zinc-100">{proposal.title}</h4>
      <p className="text-xs text-zinc-400 mt-1">{proposal.description}</p>

      {/* Render Property Diffs if present */}
      {proposal.diffPreview && proposal.diffPreview.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs space-y-1.5 font-mono">
          {proposal.diffPreview.map((diff, idx) => (
            <div key={idx} className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">{diff.field}:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400/80 line-through">{String(diff.before)}</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
                <span className="text-emerald-400 font-semibold">{String(diff.after)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {proposal.requiresConfirmation && !executed && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-400/90">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Requires explicit confirmation prior to permanent removal.</span>
        </div>
      )}
    </div>
  );
};
