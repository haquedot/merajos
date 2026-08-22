'use client';

import React from 'react';
import { Code2, Search, Plus, Minus, Copy, Edit2, Trash2 } from 'lucide-react';
import { DSATopic } from '../../types';
import { Badge } from '../ui/Badge';

interface DSAPracticeViewProps {
  dsaSearchQuery: string;
  setDSASearchQuery: (query: string) => void;
  filteredDSA: DSATopic[];
  handleOpenAddDSA: () => void;
  handleOpenEditDSA: (dsa: DSATopic) => void;
  adjustDSACount: (id: string, type: 'easy' | 'medium' | 'hard', delta: number) => void;
  handleCopyDSAToTask: (name: string) => void;
  setDeleteConfirmTarget: (target: { type: 'dsa'; id: string; title: string }) => void;
}

export function DSAPracticeView({
  dsaSearchQuery,
  setDSASearchQuery,
  filteredDSA,
  handleOpenAddDSA,
  handleOpenEditDSA,
  adjustDSACount,
  handleCopyDSAToTask,
  setDeleteConfirmTarget,
}: DSAPracticeViewProps) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-500" />
            <span>Data Structures & Algorithms (DSA) Sheet</span>
          </h2>
          <p className="text-xs text-gray-500">
            Track topic-wise solved problems with interactive counters and copy study goals into Today tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={dsaSearchQuery}
              onChange={(e) => setDSASearchQuery(e.target.value)}
              placeholder="Search DSA topics..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={handleOpenAddDSA}
            className="btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add DSA Topic</span>
          </button>
        </div>
      </div>

      {filteredDSA.length === 0 ? (
        <div className="p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Your DSA Sheet is Empty
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Add custom problem categories (e.g. Dynamic Programming, Binary Search, Graph Algorithms) to log solved problem counts.
            </p>
          </div>
          <button
            onClick={handleOpenAddDSA}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First DSA Topic</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {filteredDSA.map((dsa) => {
            const totalSolved = dsa.easySolved + dsa.mediumSolved + dsa.hardSolved;
            const totalTarget = dsa.easyTotal + dsa.mediumTotal + dsa.hardTotal;
            const perc = totalTarget > 0 ? Math.round((totalSolved / totalTarget) * 100) : 0;

            return (
              <div
                key={dsa.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-[200px] flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {dsa.name}
                    </h3>
                    <Badge variant="info" size="sm">
                      {dsa.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400 block">{dsa.notes}</span>
                </div>

                {/* Interactive Solved Counters */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Easy counter */}
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Easy: {dsa.easySolved}/{dsa.easyTotal}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'easy', -1)}
                        className="w-4 h-4 rounded-md bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center hover:opacity-80"
                      >
                        <Minus className="w-3 h-3 text-emerald-900 dark:text-white" />
                      </button>
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'easy', 1)}
                        className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:opacity-80"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Medium counter */}
                  <div className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <span>Med: {dsa.mediumSolved}/{dsa.mediumTotal}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'medium', -1)}
                        className="w-4 h-4 rounded-md bg-amber-200 dark:bg-amber-800 flex items-center justify-center hover:opacity-80"
                      >
                        <Minus className="w-3 h-3 text-amber-900 dark:text-white" />
                      </button>
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'medium', 1)}
                        className="w-4 h-4 rounded-md bg-amber-600 text-white flex items-center justify-center hover:opacity-80"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Hard counter */}
                  <div className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                    <span>Hard: {dsa.hardSolved}/{dsa.hardTotal}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'hard', -1)}
                        className="w-4 h-4 rounded-md bg-rose-200 dark:bg-rose-800 flex items-center justify-center hover:opacity-80"
                      >
                        <Minus className="w-3 h-3 text-rose-900 dark:text-white" />
                      </button>
                      <button
                        onClick={() => adjustDSACount(dsa.id, 'hard', 1)}
                        className="w-4 h-4 rounded-md bg-rose-600 text-white flex items-center justify-center hover:opacity-80"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${perc}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">
                      {perc}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyDSAToTask(dsa.name)}
                    className="px-2 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-orbit-blue hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Copy to Today Module as Task"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEditDSA(dsa)}
                    className="p-1 text-gray-400 hover:text-orbit-blue transition-colors"
                    title="Edit DSA Topic"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setDeleteConfirmTarget({
                        type: 'dsa',
                        id: dsa.id,
                        title: dsa.name,
                      })
                    }
                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    title="Delete DSA Topic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
