'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, RotateCcw, ShieldCheck, Check, Sliders } from 'lucide-react';
import { usePersonalizationStore } from '../../store/usePersonalizationStore';
import { aggregateUserSignals } from '../../lib/personalization/signals/signalAggregator';
import { DerivedSignal } from '../../lib/personalization/types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';

export const PersonalizationInspectionPanel: React.FC = () => {
  const { preferences, updatePreferences, resetAllBehavioralData } = usePersonalizationStore();
  const [signals, setSignals] = useState<DerivedSignal[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    aggregateUserSignals().then((res) => {
      setSignals(res);
    });
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAllBehavioralData();
      setSignals([]);
      setResetMsg('Behavioral learned signals reset to empty baseline!');
      setTimeout(() => setResetMsg(null), 3000);
    } catch (err) {
      setResetMsg('Failed to reset behavioral data.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>What Orbit Knows About Me</span>
              <Badge variant="purple" size="sm">
                Privacy-First
              </Badge>
            </h2>
            <p className="text-xs text-gray-500">
              Inspect learned workflow patterns, confidence levels, and fine-tune adaptive settings
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting}
          className="text-xs font-bold border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Learned Signals</span>
        </Button>
      </div>

      {resetMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          {resetMsg}
        </div>
      )}

      {/* Target Role & Daily Capacity Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
        <div className="space-y-1.5">
          <label className="font-extrabold text-gray-700 dark:text-gray-300">
            Target Career Role / Focus Goal:
          </label>
          <input
            type="text"
            value={preferences?.targetRole || 'Software Engineer'}
            onChange={(e) => updatePreferences({ targetRole: e.target.value })}
            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5BFF]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-extrabold text-gray-700 dark:text-gray-300">
            Preferred Focus Duration (Minutes):
          </label>
          <input
            type="number"
            min={15}
            max={120}
            value={preferences?.preferredFocusDurationMinutes || 45}
            onChange={(e) =>
              updatePreferences({ preferredFocusDurationMinutes: Number(e.target.value) || 45 })
            }
            className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5BFF]"
          />
        </div>
      </div>

      {/* Category Slot Affinities Inspection */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Category Time-Slot Affinities (Explicit & Learned)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Career', 'Research', 'Client', 'Personal'].map((cat) => {
            const slot = preferences?.categorySlotAffinity?.[cat] || 'morning';
            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">{cat} Work</span>
                  <span className="text-[11px] text-gray-500">
                    Optimal Slot: <strong className="capitalize text-[#6D5BFF]">{slot}</strong>
                  </span>
                </div>

                <select
                  value={slot}
                  onChange={(e) =>
                    updatePreferences({
                      categorySlotAffinity: {
                        ...preferences?.categorySlotAffinity,
                        [cat]: e.target.value as any,
                      },
                    })
                  }
                  className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5BFF]"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Learning Controls */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
        <h3 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Personalization Learning Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            {
              key: 'learnFromTaskBehavior',
              label: 'Learn from Task Behavior',
              val: preferences?.learnFromTaskBehavior ?? true,
            },
            {
              key: 'learnFromFocusSessions',
              label: 'Learn from Focus Sessions',
              val: preferences?.learnFromFocusSessions ?? true,
            },
            {
              key: 'learnFromHabits',
              label: 'Learn from Habit Tracking',
              val: preferences?.learnFromHabits ?? true,
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => updatePreferences({ [item.key]: !item.val })}
              className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                item.val
                  ? 'border-[#6D5BFF] bg-[#6D5BFF]/5 text-[#6D5BFF]'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-500'
              }`}
            >
              <span className="font-bold text-xs">{item.label}</span>
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                  item.val ? 'border-[#6D5BFF] bg-[#6D5BFF] text-white' : 'border-gray-400'
                }`}
              >
                {item.val && <Check className="w-3 h-3" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
