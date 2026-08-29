import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentActionProposal } from '../../lib/agent/types';
import { Check, Trash2, ArrowRight, AlertTriangle, Sparkles, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '../../lib/authCheck';
import { useTaskStore } from '../../store/useTaskStore';
import { db } from '../../database/dexie';

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

        if (proposal.module === 'tasks') {
          if (proposal.opType === 'DELETE') {
            const rawTarget = String(proposal.targetData?.title || proposal.targetData?.prompt || '');
            const targetLower = rawTarget.toLowerCase().replace(/["']/g, '');
            const matching = useTaskStore.getState().tasks.filter((t) =>
              t.title.toLowerCase().includes(targetLower) || targetLower.includes(t.title.toLowerCase())
            );
            for (const task of matching) {
              await useTaskStore.getState().deleteTask(task.id);
            }
          }
          // Sync with API
          fetch('/api/tasks', { headers })
            .then((r) => r.ok && r.json())
            .then(async (d) => {
              if (d && d.tasks) {
                useTaskStore.setState({ tasks: d.tasks });
                await db.tasks.clear();
                await db.tasks.bulkPut(d.tasks);
              }
            }).catch(() => {});
        }

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
        return <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">DELETE</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm">ACTION</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-2xl border transition-all shadow-md ${
        executed
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
          : proposal.opType === 'DELETE'
          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
          : 'bg-white dark:bg-[#181d2a] border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            {proposal.module}
          </span>
          {getOpBadge()}
        </div>

        {executed ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">
            <Check className="w-3.5 h-3.5" /> Executed
          </span>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              proposal.opType === 'DELETE'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
            } disabled:opacity-50`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Approve & Execute</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight">{proposal.title}</h4>
      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 font-medium">{proposal.description}</p>

      {/* Render Property Diffs if present */}
      {proposal.diffPreview && proposal.diffPreview.length > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#121620] border border-gray-200 dark:border-gray-800 text-[11px] space-y-1.5 font-mono">
          {proposal.diffPreview.map((diff, idx) => (
            <div key={idx} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400">{diff.field}:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-500 line-through">{String(diff.before)}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-emerald-500 font-extrabold">{String(diff.after)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {proposal.requiresConfirmation && !executed && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Requires explicit confirmation prior to permanent removal.</span>
        </div>
      )}
    </motion.div>
  );
};
