import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentActionProposal } from '../../lib/agent/types';
import { Check, ArrowRight, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '../../lib/authCheck';
import { useTaskStore } from '../../store/useTaskStore';
import { db } from '../../database/dexie';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

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

  const getOpBadgeVariant = () => {
    switch (proposal.opType) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-3 sm:p-4 transition-all shadow-md ${
          executed
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
            : proposal.opType === 'DELETE'
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
            : 'bg-white dark:bg-[#181d2a] border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="primary" size="sm" className="uppercase font-black text-[9px]">
              {proposal.module}
            </Badge>
            <Badge variant={getOpBadgeVariant()} size="sm" className="font-extrabold text-[9px]">
              {proposal.opType}
            </Badge>
          </div>

          {executed ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">
              <Check className="w-3.5 h-3.5" /> Executed
            </span>
          ) : (
            <Button
              size="sm"
              variant={proposal.opType === 'DELETE' ? 'destructive' : 'default'}
              onClick={handleExecute}
              disabled={isExecuting}
              className="gap-1.5 font-extrabold text-[11px] h-7 px-2.5"
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
            </Button>
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
      </Card>
    </motion.div>
  );
};
