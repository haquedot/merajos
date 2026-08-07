'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  BookOpen,
  GraduationCap,
  Activity,
  Target,
  ArrowUpRight,
  Plus,
  Flame,
  CheckSquare,
  Sparkles,
  TrendingUp,
  XCircle,
  Database,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProjectStore } from '../store/useProjectStore';
import { useResearchStore } from '../store/useResearchStore';
import { useCareerStore } from '../store/useCareerStore';
import { useHabitStore } from '../store/useHabitStore';
import { useGoalStore } from '../store/useGoalStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { CircularProgress } from '../components/ui/CircularProgress';
import { StatisticCard } from '../components/ui/StatisticCard';
import { Badge } from '../components/ui/Badge';
import { HighchartsLine } from '../components/ui/HighchartsComponents';

export default function DashboardHome() {
  const [greeting, setGreeting] = useState('Good day');
  const [mounted, setMounted] = useState(false);
  const [latestSnapshots, setLatestSnapshots] = useState<any[]>([]);

  const { tasks, toggleTaskStatus } = useTaskStore();
  const { projects } = useProjectStore();
  const { overview: researchOverview, papers: researchPapers } = useResearchStore();
  const { jobs, dsaTopics } = useCareerStore();
  const { habits, toggleHabitForDate } = useHabitStore();
  const { goals } = useGoalStore();
  const { events } = useCalendarStore();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.snapshots) {
          setLatestSnapshots(data.snapshots.slice(0, 3));
        }
      })
      .catch((err) => console.warn('Dashboard could not fetch snapshots:', err));
  }, [tasks]);

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

  // Real research progress calculation
  const totalPapers = researchPapers.length;
  const researchSubtitle = researchOverview.thesisTitle || researchOverview.paperTitle || (researchPapers[0]?.title ?? 'Thesis Research');
  const realResearchProgress = totalPapers > 0
    ? Math.round((researchPapers.filter((p) => p.status === 'cited' || p.status === 'reading').length / totalPapers) * 100)
    : (researchOverview.progress || 0);

  // Real DSA Solved calculation
  const dsaTotalSolved = dsaTopics.reduce((acc, t) => acc + t.easySolved + t.mediumSolved + t.hardSolved, 0);
  const dsaTotalQuestions = dsaTopics.reduce((acc, t) => acc + (t.easyTotal || 0) + (t.mediumTotal || 0) + (t.hardTotal || 0), 0);
  const dsaSubtitle = dsaTopics.length > 0
    ? dsaTopics.slice(0, 3).map((t) => t.name).join(', ')
    : 'Arrays, DP & Trees';
  const dsaProgressPercent = dsaTotalQuestions > 0 ? Math.round((dsaTotalSolved / dsaTotalQuestions) * 100) : 0;

  // Real Habits Completed calculation
  const habitCompletedToday = habits.filter((h) => !!h.history[todayStr]).length;
  const habitSubtitle = habits.length > 0
    ? habits.slice(0, 3).map((h) => h.name).join(', ')
    : 'No habits defined';
  const habitCompletionRate = habits.length > 0 ? Math.round((habitCompletedToday / habits.length) * 100) : 100;
  const dailyScore = Math.round(taskCompletionRate * 0.6 + habitCompletionRate * 0.4);

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

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-[#1F3B99] dark:bg-[#172033] text-white border border-[#E2E8F0] dark:border-[#243244] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-blue-100/90 text-xs md:text-sm max-w-xl">
            Plan. Focus. Execute. Grow. — You have <span className="font-bold text-white">{todayTasks.length - completedToday} tasks</span> remaining today.
          </p>
        </div>

        {/* Progress Ring Widget */}
        <div className="relative z-10 flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <CircularProgress
            percentage={taskCompletionRate}
            size={90}
            strokeWidth={8}
            color="#ffffff"
            trailColor="rgba(255, 255, 255, 0.2)"
            showText={true}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-blue-100">Daily Score</span>
            <span className="text-2xl font-black text-white">{dailyScore} / 100</span>
            <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 mt-1">
              <Flame className="w-3 h-3 fill-current text-amber-300" />
              Pro Focus Streak
            </span>
          </div>
        </div>
      </motion.div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Active Projects"
          value={activeProjectsCount}
          subtitle={activeProjectSubtitle}
          icon={Briefcase}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-500"
          trend={{ value: `${avgProjectProgress}% Avg Prog`, positive: avgProjectProgress >= 50 }}
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

      {/* Main Grid: Today Focus + Quick Action & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: MITs & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 MIT Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Today's Top 3 Most Important Tasks (MITs)
                  </h3>
                  <p className="text-xs text-gray-500">Prioritize these items before anything else</p>
                </div>
              </div>
              <Link
                href="/today"
                className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1"
              >
                View Today <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
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
                      whileHover={{ scale: 1.01 }}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                            }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-semibold block ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                              }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
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
                      >
                        {task.priority}
                      </Badge>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* 11:45 PM Node Cron History Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    Daily task and habit history
                  </h3>
                  <p className="text-xs text-gray-500">Automated daily snapshot of completed vs pending tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                          alert(`✅ Daily Summary Executed!\n\nAll ${currentTasks.length} tasks persisted & Daily Snapshot saved for ${data.snapshot.date}!`);
                        }
                      } catch (err: any) {
                        alert(`Error running summary: ${err.message}`);
                      }
                    }}
                    className="btn-secondary px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Daily Summary</span>
                  </button>
                )}
                <Link
                  href="/analytics"
                  className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1"
                >
                  Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {latestSnapshots.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-center text-xs text-gray-400">
                Node Cron calculates daily snapshots at 11:45 PM. Visit Analytics to trigger an instant run.
              </div>
            ) : (
              <div className="space-y-3">
                {latestSnapshots.map((snap) => (
                  <div
                    key={snap.date}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1F3B99] text-white font-bold">
                        {snap.date}
                      </span>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          Productivity Score: {snap.productivityScore || snap.taskCompletionRate}%
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          {snap.completedTasks} completed • {snap.pendingTasks ?? (snap.totalTasks - snap.completedTasks)} pending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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

          {/* Upcoming Tasks */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Upcoming Priority Tasks
                </h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline flex items-center gap-1"
              >
                All Tasks <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                        {t.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {t.category} • {t.estimatedHours}h est
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" size="sm">
                    {t.dueDate}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Productivity Trend & Habit Checklist */}
        <div className="space-y-6">
          {/* Weekly Trend Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Productivity Score Trend
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-500">{trendLabel}</span>
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
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Habit Streaks
                </h3>
              </div>
              <Link href="/habits" className="text-xs font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline">
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
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${isDone ? 'bg-amber-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                      >
                        {isDone && '✓'}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {h.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                      🔥 {h.currentStreak}d streak
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
