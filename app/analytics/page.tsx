'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Briefcase,
  BookOpen,
  GraduationCap,
  PieChart,
  Cloud,
  Database,
  Zap,
  Calendar,
  CheckSquare,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useResearchStore } from '../../store/useResearchStore';
import { useCareerStore } from '../../store/useCareerStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { StatisticCard } from '../../components/ui/StatisticCard';
import { Badge } from '../../components/ui/Badge';
import {
  HighchartsLine,
  HighchartsColumn,
  HighchartsDonut,
} from '../../components/ui/HighchartsComponents';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { PageHeader } from '../../components/ui/PageHeader';

import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { isUserAuthenticated, getAuthHeaders } from '../../lib/authCheck';
import { calculateDailyScore, ScoreBreakdownItem } from '../../lib/productivityCalculator';
import { DailyScoreBreakdownModal } from '../../components/modals/DailyScoreBreakdownModal';

export default function AnalyticsPage() {
  const { tasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { jobs } = useCareerStore();
  const { habits } = useHabitStore();
  const { signIn, session } = useGoogleAuth();

  const [mongoStats, setMongoStats] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSnapshotDate, setExpandedSnapshotDate] = useState<string | null>(null);

  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    score: number;
    date: string;
    items: any[];
  }>({
    isOpen: false,
    score: 0,
    date: 'Today',
    items: [],
  });

  const openScoreModalForSnapshot = (snap: any) => {
    const score = snap.productivityScore || snap.taskCompletionRate || 0;
    const totalTasks = snap.totalTasks || 0;
    const completedTasks = snap.completedTasks || 0;
    const taskRate = snap.taskCompletionRate || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

    const items: ScoreBreakdownItem[] = [
      {
        id: 'tasks',
        label: 'Task Completion',
        category: 'tasks',
        pointsEarned: Math.round((taskRate / 100) * 40),
        maxPoints: 40,
        details: `${completedTasks} of ${totalTasks} tasks completed`,
        percentage: taskRate,
        color: '#3B82F6',
      },
    ];

    if (snap.totalHabitsCount && snap.totalHabitsCount > 0) {
      const habitRate = snap.habitCompletionRate || Math.round(((snap.completedHabitsCount || 0) / snap.totalHabitsCount) * 100);
      items.push({
        id: 'habits',
        label: 'Habits Routine',
        category: 'habits' as const,
        pointsEarned: Math.round((habitRate / 100) * 60),
        maxPoints: 60,
        details: `${snap.completedHabitsCount || 0} of ${snap.totalHabitsCount} habits maintained`,
        percentage: habitRate,
        color: '#10B981',
      });
    }

    setScoreModalState({
      isOpen: true,
      score,
      date: snap.date || 'Historical Date',
      items,
    });
  };

  // Fetch live MongoDB analytics and snapshots (if authenticated)
  useEffect(() => {
    isUserAuthenticated().then(async (authenticated) => {
      if (!authenticated) {
        setIsLoading(false);
        return;
      }
      const headers = await getAuthHeaders();
      fetch('/api/analytics', { headers })
        .then((res) => res.json())
        .then((data) => {
          if (data.summary) {
            setMongoStats(data.summary);
          }
          if (data.snapshots) {
            setSnapshots(data.snapshots);
            if (data.snapshots.length > 0) {
              setExpandedSnapshotDate(data.snapshots[0].date);
            }
          }
        })
        .catch((err) => console.warn('Could not fetch MongoDB analytics:', err))
        .finally(() => setIsLoading(false));
    });
  }, [tasks]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const triggerDaily1145PMCalculation = async () => {
    setIsCalculating(true);
    try {
      const currentTasks = useTaskStore.getState().tasks;
      const settings = useSettingsStore.getState().settings;
      const res = await fetch('/api/cron/calculate-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentTasks,
          emailOptions: {
            enabled: settings.emailNotificationsEnabled ?? true,
            recipientEmail: session?.email || settings.notificationEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        setSnapshots((prev) => [data.snapshot, ...prev.filter((s) => s.date !== data.snapshot.date)]);
        setExpandedSnapshotDate(data.snapshot.date);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Dynamic calculations from real live items
  const totalTasks = mongoStats?.totalTasks ?? tasks.length;
  const completedTasks = mongoStats?.completedTasks ?? tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstHours = mongoStats?.totalEstHours ?? tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalActualHours = mongoStats?.totalActualHours ?? tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);

  // Category task distribution from REAL tasks
  const clientTaskCount = mongoStats?.clientTasksCount ?? tasks.filter((t) => t.category === 'Client').length;
  const researchTaskCount = mongoStats?.researchTasksCount ?? tasks.filter((t) => t.category === 'Research').length;
  const careerTaskCount = mongoStats?.careerTasksCount ?? tasks.filter((t) => t.category === 'Career').length;
  const personalTaskCount = mongoStats?.personalTasksCount ?? tasks.filter((t) => t.category === 'Personal' || t.category === 'Habit').length;

  const realCategoryDonutData = [
    { name: 'Client Projects', y: clientTaskCount, color: '#0066FF' },
    { name: 'Research & Thesis', y: researchTaskCount, color: '#FF6B00' },
    { name: 'Career & DSA', y: careerTaskCount, color: '#10B981' },
    { name: 'Personal & Habits', y: personalTaskCount, color: '#8B5CF6' },
  ].filter((d) => d.y > 0);

  // Real Job status counts
  const jobAppliedCount = jobs.filter((j) => j.status === 'Applied').length;
  const jobOACount = jobs.filter((j) => j.status === 'OA').length;
  const jobInterviewCount = jobs.filter((j) => j.status === 'Interview').length;
  const jobOfferCount = jobs.filter((j) => j.status === 'Offer').length;

  const realJobDonutData = [
    { name: 'Applied', y: jobAppliedCount, color: '#0066FF' },
    { name: 'OA Assessment', y: jobOACount, color: '#FF6B00' },
    { name: 'Interview', y: jobInterviewCount, color: '#10B981' },
    { name: 'Offer', y: jobOfferCount, color: '#8B5CF6' },
  ].filter((d) => d.y > 0);

  // Highcharts series data mapped chronologically
  const sortedChronological = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const snapshotDates = sortedChronological.length > 0 ? sortedChronological.map((s) => s.date) : ['Today'];
  const snapshotRates = sortedChronological.length > 0 ? sortedChronological.map((s) => s.taskCompletionRate) : [taskCompletionRate];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <PageHeader
        icon={Activity}
        iconBgColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        title="Performance & Productivity Insights"
        badgeText="Summary @ 11:45 PM"
        badgeVariant="emerald"
        subtitle="Daily task and habit history is automatically calculated every evening at 11:45 PM"
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
            {process.env.NEXT_PUBLIC_RUN_CRON_JOB === 'true' && (
              <button
                onClick={triggerDaily1145PMCalculation}
                disabled={isCalculating}
                className="btn-secondary px-3 sm:px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span>{isCalculating ? 'Calculating...' : 'Run Summary'}</span>
              </button>
            )}

            <button
              onClick={signIn}
              className="btn-primary px-3 sm:px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Cloud className="w-4 h-4" />
              <span>Sync Google</span>
            </button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatisticCard
          title="Task Completion Rate"
          value={`${taskCompletionRate}%`}
          subtitle={`${completedTasks} of ${totalTasks} tasks completed`}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-500"
          trend={{ value: `${completedTasks} Completed`, positive: true }}
        />
        <StatisticCard
          title="Logged Hours"
          value={`${totalActualHours}h`}
          subtitle={`Target: ${totalEstHours}h estimated`}
          icon={Clock}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-orbit-blue"
          trend={{ value: `${totalTasks} Active Tasks`, positive: true }}
        />
        <StatisticCard
          title="Active Projects"
          value={projects.length}
          subtitle={`${projects.filter((p) => p.status === 'active').length} active projects`}
          icon={Briefcase}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-500"
          trend={{ value: 'Client Projects', positive: true }}
        />
        <StatisticCard
          title="Job Pipeline"
          value={jobs.length}
          subtitle={`${jobInterviewCount} interviewing, ${jobOACount} OA`}
          icon={GraduationCap}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-orbit-orange"
          trend={{ value: 'Job Applications', positive: true }}
        />
      </div>

      {/* Highcharts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Highcharts Line Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orbit-blue shrink-0" />
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                Daily Completion Trend
              </h3>
            </div>
          </div>

          <HighchartsLine
            categories={snapshotDates}
            seriesData={[
              { name: 'Completion Rate %', data: snapshotRates, color: '#0066FF' },
            ]}
            height={260}
          />
        </div>

        {/* Highcharts Column Chart */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orbit-orange shrink-0" />
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                Work Hours Breakdown by Category
              </h3>
            </div>
          </div>

          <HighchartsColumn
            categories={['Client', 'Research', 'Career', 'Personal']}
            seriesData={[
              {
                name: 'Estimated Hours',
                data: [
                  tasks.filter((t) => t.category === 'Client').reduce((a, b) => a + (b.estimatedHours || 0), 0),
                  tasks.filter((t) => t.category === 'Research').reduce((a, b) => a + (b.estimatedHours || 0), 0),
                  tasks.filter((t) => t.category === 'Career').reduce((a, b) => a + (b.estimatedHours || 0), 0),
                  tasks.filter((t) => t.category === 'Personal').reduce((a, b) => a + (b.estimatedHours || 0), 0),
                ],
                color: '#0066FF',
              },
              {
                name: 'Actual Logged Hours',
                data: [
                  tasks.filter((t) => t.category === 'Client').reduce((a, b) => a + (b.actualHours || 0), 0),
                  tasks.filter((t) => t.category === 'Research').reduce((a, b) => a + (b.actualHours || 0), 0),
                  tasks.filter((t) => t.category === 'Career').reduce((a, b) => a + (b.actualHours || 0), 0),
                  tasks.filter((t) => t.category === 'Personal').reduce((a, b) => a + (b.actualHours || 0), 0),
                ],
                color: '#FF6B00',
              },
            ]}
            height={260}
          />
        </div>
      </div>

      {/* 11:45 PM Daily History Log Section */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Daily History & Performance Log
              </h3>
              <p className="text-xs text-gray-500">
                Detailed record of completed tasks, pending tasks, habits, and daily productivity scores
              </p>
            </div>
          </div>

          <Badge variant="purple" size="sm" className="self-start sm:self-auto shrink-0">
            {snapshots.length} Snapshots
          </Badge>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            No snapshots stored yet. Click "Run Summary" to generate today's snapshot!
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snap) => {
              const isExpanded = expandedSnapshotDate === snap.date;

              return (
                <div
                  key={snap.date}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-800/20"
                >
                  {/* Snapshot Accordion Header */}
                  <div
                    onClick={() => setExpandedSnapshotDate(isExpanded ? null : snap.date)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <div className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs shrink-0">
                        {snap.date}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openScoreModalForSnapshot(snap);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold hover:bg-indigo-100 transition-colors border border-indigo-200/60 dark:border-indigo-800"
                          title="Click to view detailed score breakdown pointers for this date"
                        >
                          Score: {snap.productivityScore || snap.taskCompletionRate}%
                        </button>
                        <span className="text-gray-300 dark:text-gray-600 hidden xs:inline">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {snap.completedTasks} Completed
                        </span>
                        <span className="text-gray-300 dark:text-gray-600 hidden xs:inline">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {snap.pendingTasks ?? (snap.totalTasks - snap.completedTasks)} Pending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200 dark:border-gray-800">
                      {snap.habitCompletionRate !== undefined && (
                        <Badge variant="outline" size="sm" className="text-[10px]">
                          Habits: {snap.completedHabitsCount ?? 0}/{snap.totalHabitsCount ?? 0} ({snap.habitCompletionRate}%)
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Snapshot Breakdown */}
                  {isExpanded && (
                    <div className="p-3.5 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4 text-xs">
                      {/* Completed vs Non-Completed Task Lists */}
                      {(() => {
                        const completedList =
                          snap.completedTaskDetails && snap.completedTaskDetails.length > 0
                            ? snap.completedTaskDetails
                            : snap.completedTaskTitles && snap.completedTaskTitles.length > 0
                            ? snap.completedTaskTitles.map((t: string) => ({ title: t }))
                            : tasks.filter((t) => t.status === 'completed').map((t) => ({ title: t.title, category: t.category, priority: t.priority }));

                        const pendingList =
                          snap.pendingTaskDetails && snap.pendingTaskDetails.length > 0
                            ? snap.pendingTaskDetails
                            : snap.pendingTaskTitles && snap.pendingTaskTitles.length > 0
                            ? snap.pendingTaskTitles.map((t: string) => ({ title: t }))
                            : tasks.filter((t) => t.status !== 'completed').map((t) => ({ title: t.title, category: t.category, priority: t.priority }));

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                            {/* Completed Tasks List */}
                            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Completed Tasks ({completedList.length})</span>
                              </div>
                              {completedList.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {completedList.map((tItem: any, idx: number) => (
                                    <li
                                      key={idx}
                                      className="flex items-start sm:items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/50"
                                    >
                                      <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1 sm:mt-0" />
                                        <span className="font-bold text-gray-900 dark:text-white text-xs leading-snug break-words">
                                          {tItem.title || tItem}
                                        </span>
                                      </div>
                                      {tItem.category && (
                                        <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                                          {tItem.category}
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-400 italic">No tasks completed on this date.</p>
                              )}
                            </div>

                            {/* Non-Completed (Pending) Tasks List */}
                            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>Non-Completed / Pending Tasks ({pendingList.length})</span>
                              </div>
                              {pendingList.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {pendingList.map((tItem: any, idx: number) => (
                                    <li
                                      key={idx}
                                      className="flex items-start sm:items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/50"
                                    >
                                      <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1 sm:mt-0" />
                                        <span className="font-bold text-gray-900 dark:text-white text-xs leading-snug break-words">
                                          {tItem.title || tItem}
                                        </span>
                                      </div>
                                      {tItem.category && (
                                        <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                                          {tItem.category}
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-400 italic">All tasks were completed!</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Category & Priority Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Client Tasks</span>
                          <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block text-xs">
                            {snap.categoryBreakdown?.Client?.completed ?? 0} Done / {snap.categoryBreakdown?.Client?.pending ?? 0} Pending
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Research Tasks</span>
                          <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block text-xs">
                            {snap.categoryBreakdown?.Research?.completed ?? 0} Done / {snap.categoryBreakdown?.Research?.pending ?? 0} Pending
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Career Tasks</span>
                          <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block text-xs">
                            {snap.categoryBreakdown?.Career?.completed ?? 0} Done / {snap.categoryBreakdown?.Career?.pending ?? 0} Pending
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Logged Hours</span>
                          <span className="font-extrabold text-gray-900 dark:text-white mt-0.5 block text-xs">
                            {snap.totalActualHours}h / {snap.totalEstHours}h est
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Score Breakdown Modal */}
      <DailyScoreBreakdownModal
        isOpen={scoreModalState.isOpen}
        onClose={() => setScoreModalState((prev) => ({ ...prev, isOpen: false }))}
        dailyScore={scoreModalState.score}
        breakdownItems={scoreModalState.items}
        dateTitle={scoreModalState.date}
      />
    </div>
  );
}
