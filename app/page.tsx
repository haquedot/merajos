'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Briefcase,
  BookOpen,
  GraduationCap,
  Activity,
  Target,
  ArrowUpRight,
  Flame,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Database,
  ShieldCheck,
  Scale,
  Mail,
  Info,
  Lock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, ResearchProject, ResearchSection, ResearchPaper } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProjectStore } from '../store/useProjectStore';
import { useResearchStore } from '../store/useResearchStore';
import { useCareerStore } from '../store/useCareerStore';
import { useHabitStore } from '../store/useHabitStore';
import { useGoalStore } from '../store/useGoalStore';
import { CircularProgress } from '../components/ui/CircularProgress';
import { StatisticCard } from '../components/ui/StatisticCard';
import { Badge } from '../components/ui/Badge';
import { calculateDailyScore } from '../lib/productivityCalculator';
import { HighchartsLine } from '../components/ui/HighchartsComponents';

import { isUserAuthenticated } from '../lib/authCheck';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { NowFocusCard } from '@/components/dashboard/NowFocusCard';
import { FocusOverlayModal } from '@/components/modals/FocusOverlayModal';
import { PublicAppOverviewBanner } from '@/components/landing/PublicAppOverviewBanner';

export default function DashboardHome() {
  const [greeting, setGreeting] = useState('Good day');
  const [mounted, setMounted] = useState(false);
  const [latestSnapshots, setLatestSnapshots] = useState<any[]>([]);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<any>(null);

  const { tasks, toggleTaskStatus, isLoading: isLoadingTasks } = useTaskStore();
  const { projects } = useProjectStore();
  const { projects: researchProjects } = useResearchStore();
  const { dsaTopics } = useCareerStore();
  const { habits, toggleHabitForDate } = useHabitStore();
  const { goals } = useGoalStore();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) return;
      fetch('/api/analytics')
        .then((res) => res.json())
        .then((data) => {
          if (data.snapshots) {
            setLatestSnapshots(data.snapshots.slice(0, 3));
          }
        })
        .catch((err) => console.warn('Dashboard could not fetch snapshots:', err));
    });
  }, [tasks]);

  if (!mounted || isLoadingTasks) {
    return <DashboardSkeleton />;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  const mits = tasks.filter((t) => t.mit);
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate >= todayStr).slice(0, 4);

  // Real active projects calculation
  const activeProjects = projects.filter((p) => p.status === 'active');
  const activeProjectsCount = activeProjects.length;
  const activeProjectSubtitle = activeProjects.length > 0
    ? activeProjects.slice(0, 2).map((p) => p.name).join(' & ')
    : (projects[0]?.name ?? 'No active projects');
  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  // Real research progress calculation across all projects
  const allPapers = researchProjects.flatMap((proj: ResearchProject) =>
    proj.sections.flatMap((s: ResearchSection) => s.papers ?? [])
  );
  const totalPapers = allPapers.length;
  const researchSubtitle = researchProjects[0]?.title ?? 'No research added yet';
  const realResearchProgress = totalPapers > 0
    ? Math.round((allPapers.filter((p: ResearchPaper) => p.status === 'cited' || p.status === 'reading').length / totalPapers) * 100)
    : (researchProjects[0]?.progress || 0);

  // Real DSA Solved calculation
  const dsaTotalSolved = dsaTopics.reduce((acc, t) => acc + t.easySolved + t.mediumSolved + t.hardSolved, 0);
  const dsaTotalQuestions = dsaTopics.reduce((acc, t) => acc + (t.easyTotal || 0) + (t.mediumTotal || 0) + (t.hardTotal || 0), 0);
  const dsaSubtitle = dsaTopics.length > 0
    ? dsaTopics.slice(0, 3).map((t) => t.name).join(', ')
    : 'No DSA topics added';
  const dsaProgressPercent = dsaTotalQuestions > 0 ? Math.round((dsaTotalSolved / dsaTotalQuestions) * 100) : 0;

  // Real Habits Completed calculation
  const habitCompletedToday = habits.filter((h) => !!h.history[todayStr]).length;
  const habitSubtitle = habits.length > 0
    ? habits.slice(0, 3).map((h) => h.name).join(', ')
    : 'No habits defined';
  const habitCompletionRate = habits.length > 0 ? Math.round((habitCompletedToday / habits.length) * 100) : 0;

  // Dynamic Modular Daily Score Calculation with Empty State Guard
  const { dailyScore, hasRecordedItems } = calculateDailyScore({
    todayTasks,
    habitsCount: habits.length,
    completedHabitsCount: habitCompletedToday,
    projectsCount: projects.length,
    goalsCount: goals.length,
    completedGoalsCount: goals.filter((g) => g.progress >= 100).length,
    researchCount: totalPapers,
    dsaCount: dsaTopics.length,
  });

  // Real Highcharts data from latest snapshots
  const sortedSnapshots = [...latestSnapshots].sort((a, b) => a.date.localeCompare(b.date));

  const chartCategories = sortedSnapshots.length > 0
    ? sortedSnapshots.map((s) => s.date.slice(5))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  const chartScores = sortedSnapshots.length > 0
    ? sortedSnapshots.map((s) => s.productivityScore ?? s.taskCompletionRate ?? 0)
    : [dailyScore, dailyScore, dailyScore, dailyScore, dailyScore, dailyScore, dailyScore];

  const lastScore = chartScores[chartScores.length - 1] ?? dailyScore;
  const prevScore = chartScores.length > 1 ? chartScores[chartScores.length - 2] : dailyScore;
  const scoreDiff = lastScore - prevScore;
  const trendLabel = sortedSnapshots.length > 1
    ? `${scoreDiff >= 0 ? '+' : ''}${scoreDiff}% vs prev snapshot`
    : `${dailyScore}% Score Today`;

  // Time-aware focus task selection algorithm
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getTaskMinutes = (t: Task) => {
    if (t.time) {
      const [h, m] = t.time.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    if (t.timeSlot === 'morning') return 9 * 60;
    if (t.timeSlot === 'afternoon') return 14 * 60;
    if (t.timeSlot === 'evening') return 18 * 60;
    if (t.timeSlot === 'night') return 22 * 60;
    return 12 * 60;
  };

  const uncompletedToday = todayTasks.filter((t) => t.status !== 'completed');

  // Sort today's uncompleted tasks by: 1) MIT, 2) proximity to current time, 3) priority
  const sortedFocusCandidates = [...uncompletedToday].sort((a, b) => {
    if (a.mit !== b.mit) return a.mit ? -1 : 1;
    const diffA = Math.abs(getTaskMinutes(a) - currentMinutes);
    const diffB = Math.abs(getTaskMinutes(b) - currentMinutes);
    if (diffA !== diffB) return diffA - diffB;
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const currentFocusTask = sortedFocusCandidates[0] || mits.find((t) => t.status !== 'completed') || upcomingTasks[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Public App Overview & Hero Banner (Google OAuth Verification Compliance) */}
      {/* <PublicAppOverviewBanner /> */}

      {/* Top Banner Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-[#1F3B99] dark:bg-[#172033] text-white border border-[#E2E8F0] dark:border-[#243244] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-md"
      >
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            Plan. Focus. Execute. Grow. — You have
            <Link href="/today" className="mx-1 font-bold text-white hover:underline hover:cursor-pointer">{todayTasks.length - completedToday} tasks</Link>
            remaining today.
          </p>
        </div>

        {/* Progress Ring Widget */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-6 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 w-full sm:w-auto justify-between sm:justify-start shrink-0">
          <CircularProgress
            percentage={hasRecordedItems ? taskCompletionRate : 0}
            size={76}
            strokeWidth={7}
            color="#ffffff"
            trailColor="rgba(255, 255, 255, 0.2)"
            showText={true}
          />
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-100">Daily Score</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {hasRecordedItems ? `${dailyScore} / 100` : 'Not Started'}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-300 font-bold flex items-center gap-1 mt-0.5" title="Calculated dynamically from active user modules & MIT tasks">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" />
              {hasRecordedItems ? `${dailyScore}% Score Today` : 'Add tasks to start'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* NOW / Current Focus Card */}
      <NowFocusCard
        currentTask={currentFocusTask}
        onStartFocus={(task) => {
          setActiveFocusTask(task || currentFocusTask);
          setIsFocusModalOpen(true);
        }}
      />

      {/* Fullscreen Distraction-Free Focus Mode Modal Overlay */}
      <FocusOverlayModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        taskTitle={activeFocusTask?.title || 'Deep Focus Session'}
        category={activeFocusTask?.category || 'General'}
        onCompleteTask={
          activeFocusTask?.id
            ? () => toggleTaskStatus(activeFocusTask.id)
            : undefined
        }
      />

      {/* Overview Stat Cards Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatisticCard
          title="Active Projects"
          value={activeProjectsCount}
          subtitle={activeProjectSubtitle}
          icon={Briefcase}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-500"
          trend={{ value: `${avgProjectProgress}% Avg`, positive: avgProjectProgress >= 50 }}
        />
        <StatisticCard
          title="Research Progress"
          value={`${realResearchProgress}%`}
          subtitle={researchSubtitle}
          icon={BookOpen}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-500"
          trend={{ value: `${totalPapers} Paper${totalPapers === 1 ? '' : 's'}`, positive: totalPapers > 0 }}
        />
        <StatisticCard
          title="DSA Solved"
          value={dsaTotalSolved}
          subtitle={dsaSubtitle}
          icon={GraduationCap}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-500"
          trend={{ value: `${dsaProgressPercent}% Goal`, positive: dsaProgressPercent > 0 }}
        />
        <StatisticCard
          title="Habits Completed"
          value={`${habitCompletedToday}/${habits.length}`}
          subtitle={habitSubtitle}
          icon={Activity}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-500"
          trend={{ value: `${habitCompletionRate}% Today`, positive: habitCompletionRate >= 50 }}
        />
      </div>

      {/* Main Grid: Focus + Quick Action & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: MITs & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Top 3 MIT Section */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    Today's Top 3 MITs
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">Prioritize these items before anything else</p>
                </div>
              </div>
              <Link
                href="/today"
                className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1 shrink-0"
              >
                Today <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {mits.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-center text-xs text-gray-500">
                  No MITs designated for today yet. Select tasks in the Tasks tab and toggle MIT.
                </div>
              ) : (
                mits.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 cursor-pointer flex items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                            }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs sm:text-sm font-semibold block leading-tight ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                              }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                            <Badge variant={task.category === 'Client' ? 'purple' : task.category === 'Research' ? 'info' : 'primary'} size="sm">
                              {task.category}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                Due {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'danger'
                            : task.priority === 'high'
                              ? 'warning'
                              : 'secondary'
                        }
                        size="sm"
                        className="shrink-0 self-start sm:self-center"
                      >
                        {task.priority}
                      </Badge>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Node Cron History Widget */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                    Daily Task & Habit History
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">Automated snapshot of completed vs pending tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                {process.env.NEXT_PUBLIC_RUN_CRON_JOB === 'true' && (
                  <button
                    onClick={async () => {
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
                              recipientEmail: settings.notificationEmail,
                            },
                          }),
                        });
                        const data = await res.json();
                        if (data.snapshot) {
                          setLatestSnapshots((prev) => [data.snapshot, ...prev.filter((s) => s.date !== data.snapshot.date)]);
                        }
                      } catch (err: any) {
                        console.error('Error running summary:', err);
                      }
                    }}
                    className="btn-secondary px-2.5 py-1 rounded-xl text-[11px] sm:text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Summary</span>
                  </button>
                )}
                <Link
                  href="/analytics"
                  className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1"
                >
                  Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {latestSnapshots.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-center text-xs text-gray-400">
                Daily snapshots generated at 11:45 PM. Visit Analytics to run on-demand.
              </div>
            ) : (
              <div className="space-y-2.5">
                {latestSnapshots.map((snap) => (
                  <div
                    key={snap.date}
                    className="p-3 sm:p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-[#1F3B99] text-white font-bold text-[11px] shrink-0">
                        {snap.date}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">
                          Productivity Score: {snap.productivityScore || snap.taskCompletionRate}%
                        </span>
                        <span className="text-gray-400 text-[10px] sm:text-[11px]">
                          {snap.completedTasks} completed • {snap.pendingTasks ?? (snap.totalTasks - snap.completedTasks)} pending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px]">
                        ✓ {snap.completedTasks} Done
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-bold text-[10px]">
                        ● {snap.pendingTasks ?? (snap.totalTasks - snap.completedTasks)} Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Priority Tasks */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                  Upcoming Priority Tasks
                </h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1 shrink-0"
              >
                All Tasks <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block truncate">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate block">
                        {t.category} • {t.estimatedHours}h est
                      </span>
                    </div>
                  </div>
                  <Badge variant={t.status === 'archived' ? 'secondary' : 'outline'} size="sm" className="shrink-0">
                    {t.dueDate}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Productivity Trend & Habit Checklist */}
        <div className="space-y-4 sm:space-y-6">
          {/* Weekly Trend Chart */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  Productivity Trend
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-500 shrink-0">{trendLabel}</span>
            </div>

            <HighchartsLine
              categories={chartCategories}
              seriesData={[
                {
                  name: 'Productivity Score',
                  data: chartScores,
                  color: '#6D5BFF',
                },
              ]}
              height={180}
            />
          </div>

          {/* Quick Habits */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  Habit Streaks
                </h3>
              </div>
              <Link href="/habits" className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline shrink-0">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {habits.slice(0, 4).map((h) => {
                const isDone = !!h.history[todayStr];
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabitForDate(h.id, todayStr)}
                    className="p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between gap-2 transition-colors min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${isDone ? 'bg-amber-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                      >
                        {isDone && '✓'}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {h.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full shrink-0">
                      🔥 {h.currentStreak}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Purpose & Application Overview Section (Google OAuth Verification Compliance) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                About Orbit — Purpose & Application Overview
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personal Productivity Command Center & Workspace Management Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <Link
              href="/privacy"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy Policy</span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/terms"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              What Orbit Does
            </h3>
            <p>
              Orbit helps developers, researchers, professionals, and students organize their daily workflow into a unified dashboard. It combines task prioritization, habit tracking, research paper notes, DSA career prep, and client project management.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-purple-500" />
              Google Calendar Integration
            </h3>
            <p>
              Orbit integrates with your Google Account via OAuth 2.0 and Google Calendar API to view and edit events. Time slots, task deadlines, and focus sessions created in Orbit automatically sync with your Google Calendar to keep your daily schedule unified.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              Data Security & Privacy
            </h3>
            <p>
              Your productivity data belongs to you. Data is stored locally in your browser IndexedDB cache with encrypted cloud backup options. We strictly adhere to Google Limited Use requirements and never monetize or sell user data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
          <span>Official Domain: <strong>orbit.merajulhaque.com</strong></span>
          <a
            href="mailto:haquedot@gmail.com"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span>Support & Inquiries: haquedot@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
