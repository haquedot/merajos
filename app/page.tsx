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
import { getSmartFocusTask, sortTasksChronologically } from '../lib/taskUtils';
import { HighchartsLine } from '../components/ui/HighchartsComponents';

import { isUserAuthenticated } from '../lib/authCheck';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { NowFocusCard } from '@/components/dashboard/NowFocusCard';
import { FocusOverlayModal } from '@/components/modals/FocusOverlayModal';
import { PublicAppOverviewBanner } from '@/components/landing/PublicAppOverviewBanner';
import { DailyScoreBreakdownModal } from '../components/modals/DailyScoreBreakdownModal';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function DashboardHome() {
  const [greeting, setGreeting] = useState('Good day');
  const [mounted, setMounted] = useState(false);
  const [latestSnapshots, setLatestSnapshots] = useState<any[]>([]);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<any>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const {
    tasks,
    toggleTaskStatus,
    isLoading: isLoadingTasks,
    customFocusTaskId,
    setCustomFocusTaskId,
  } = useTaskStore();
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
  const { dailyScore, hasRecordedItems, breakdownItems } = calculateDailyScore({
    todayTasks,
    habitsCount: habits.length,
    completedHabitsCount: habitCompletedToday,
    habitsList: habits.map((h) => ({ id: h.id, name: h.name, isCompleted: !!h.history[todayStr] })),
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

  // Shared unified Focus Task calculation (matches Today Page)
  const sortedTodayTasks = sortTasksChronologically(todayTasks);
  const smartFocusTask = getSmartFocusTask(sortedTodayTasks);
  const customFocusTask = sortedTodayTasks.find(
    (t) => t.id === customFocusTaskId && t.status !== 'completed'
  );
  const currentFocusTask = customFocusTask || smartFocusTask || upcomingTasks[0] || null;
  const isCustomFocus = !!customFocusTask;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Public App Overview & Hero Banner (Google OAuth Verification Compliance) */}
      {/* <PublicAppOverviewBanner /> */}

      {/* Top Banner Greeting with Animated Shining Border */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl sm:rounded-3xl p-[1.5px] overflow-hidden group shadow-lg"
      >
        {/* Continuous Rotating Conic Gradient Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />

        {/* Inner Banner Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 rounded-[calc(1rem-1.5px)] sm:rounded-[calc(1.5rem-1.5px)] bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between gap-4 sm:gap-6">
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

          {/* Progress Ring Widget (Clickable to view Score Breakdown) */}
          <div
            onClick={() => {
              hasRecordedItems ? setIsScoreModalOpen(true) : setQuickAddOpen(true);
            }}
            className="relative z-10 flex items-center gap-3.5 sm:gap-6 sm:border sm:border-white/10 sm:p-3 sm:rounded-3xl sm:bg-white/10 sm:backdrop-blur-md justify-between sm:justify-start shrink-0 cursor-pointer transition-all duration-200 group/widget"
          >
            <CircularProgress
              percentage={hasRecordedItems ? dailyScore : 0}
              size={76}
              strokeWidth={7}
              color="#ffffff"
              trailColor="rgba(255, 255, 255, 0.2)"
              showText={true}
            />
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-100">Daily Score</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-blue-200 opacity-60 group-hover/widget:opacity-100 transition-opacity" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow-xl">
                    {hasRecordedItems ? 'Click for details' : 'Click to start'}
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">
                {hasRecordedItems ? `${dailyScore} / 100` : 'Not Started'}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
                <Button
                  variant={'link'}
                  className='text-emerald-300 hover:underline p-0 h-auto text-[10px] sm:text-xs'
                  onClick={(e) => {
                    e.stopPropagation();
                    hasRecordedItems ? setIsScoreModalOpen(true) : setQuickAddOpen(true);
                  }}>
                  {hasRecordedItems ? `Click for details` : `Add tasks to start`}
                </Button>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Score Breakdown Modal */}
      <DailyScoreBreakdownModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        dailyScore={dailyScore}
        breakdownItems={breakdownItems}
      />

      {/* NOW / Current Focus Card */}
      <NowFocusCard
        currentTask={currentFocusTask}
        allTodayTasks={sortedTodayTasks}
        isCustomFocus={isCustomFocus}
        onSelectFocusTask={(task) => setCustomFocusTaskId(task?.id || null)}
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

      {/* quick add modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />

      {/* Overview Stat Cards Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Tooltip>
          <TooltipTrigger>
            <Link href="/clients">
              <StatisticCard
                title="Active Projects"
                value={activeProjectsCount}
                subtitle={activeProjectSubtitle}
                icon={Briefcase}
                iconBgColor="bg-purple-50 dark:bg-purple-950/40"
                iconColor="text-purple-500"
                trend={{ value: `${avgProjectProgress}% Avg`, positive: avgProjectProgress >= 50 }}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow-xl">
            Click to manage active client projects
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Link href="/research">
              <StatisticCard
                title="Research Progress"
                value={`${realResearchProgress}%`}
                subtitle={researchSubtitle}
                icon={BookOpen}
                iconBgColor="bg-blue-50 dark:bg-blue-950/40"
                iconColor="text-blue-500"
                trend={{ value: `${totalPapers} Paper${totalPapers === 1 ? '' : 's'}`, positive: totalPapers > 0 }}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow-xl">
            Click to explore research reading list
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Link href="/career">
              <StatisticCard
                title="DSA Solved"
                value={dsaTotalSolved}
                subtitle={dsaSubtitle}
                icon={GraduationCap}
                iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
                iconColor="text-emerald-500"
                trend={{ value: `${dsaProgressPercent}% Goal`, positive: dsaProgressPercent > 0 }}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow-xl">
            Click to open career prep & problem tracker
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Link href="/habits">
              <StatisticCard
                title="Habits Completed"
                value={`${habitCompletedToday}/${habits.length}`}
                subtitle={habitSubtitle}
                icon={Activity}
                iconBgColor="bg-amber-50 dark:bg-amber-950/40"
                iconColor="text-amber-500"
                trend={{ value: `${habitCompletionRate}% Today`, positive: habitCompletionRate >= 50 }}
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-900 text-white font-medium text-xs px-3 py-1.5 rounded-xl shadow-xl">
            Click to view and check off daily habits
          </TooltipContent>
        </Tooltip>
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
      {/* <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
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
      </div> */}
    </div>
  );
}
