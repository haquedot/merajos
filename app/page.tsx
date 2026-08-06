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
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useResearchStore } from '../store/useResearchStore';
import { useCareerStore } from '../store/useCareerStore';
import { useHabitStore } from '../store/useHabitStore';
import { useGoalStore } from '../store/useGoalStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { CircularProgress } from '../components/ui/CircularProgress';
import { StatisticCard } from '../components/ui/StatisticCard';
import { Badge } from '../components/ui/Badge';
import { SVGLineChart, SVGDonutChart } from '../components/ui/SVGCharts';

export default function DashboardHome() {
  const [greeting, setGreeting] = useState('Good day');
  const [mounted, setMounted] = useState(false);

  const { tasks, toggleTaskStatus } = useTaskStore();
  const { projects } = useProjectStore();
  const { overview: researchOverview } = useResearchStore();
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
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  const mits = tasks.filter((t) => t.mit);
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate >= todayStr).slice(0, 4);

  // Overall statistics
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const dsaTotalSolved = dsaTopics.reduce((acc, t) => acc + t.easySolved + t.mediumSolved + t.hardSolved, 0);

  // Productivity Score Calculation
  const habitCompletedToday = habits.filter((h) => !!h.history[todayStr]).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((habitCompletedToday / habits.length) * 100) : 100;
  const dailyScore = Math.round(taskCompletionRate * 0.6 + habitCompletionRate * 0.4);

  // Productivity Trend line chart data
  const trendData = [
    { label: 'Mon', value: 75 },
    { label: 'Tue', value: 85 },
    { label: 'Wed', value: 65 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 82 },
    { label: 'Sat', value: 95 },
    { label: 'Sun', value: dailyScore },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
              Meraj Personal Operating System
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {greeting}, Meraj 👋
          </h1>
          <p className="text-blue-100/90 text-xs md:text-sm max-w-xl">
            You have <span className="font-bold text-white">{todayTasks.length - completedToday} tasks</span> remaining today and {mits.length} priority focus items. Keep up the high momentum!
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
          subtitle="Sanab & MasjidMadarsa"
          icon={Briefcase}
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-500"
          trend={{ value: '78% Avg Prog', positive: true }}
        />
        <StatisticCard
          title="Research Progress"
          value={`${researchOverview.progress}%`}
          subtitle="Transformer Thesis Paper"
          icon={BookOpen}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-500"
          trend={{ value: '34 Papers', positive: true }}
        />
        <StatisticCard
          title="DSA Solved"
          value={dsaTotalSolved}
          subtitle="Arrays, DP & Trees"
          icon={GraduationCap}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-500"
          trend={{ value: 'Active Prep', positive: true }}
        />
        <StatisticCard
          title="Habits Completed"
          value={`${habitCompletedToday}/${habits.length}`}
          subtitle="Fajr, Quran, Exercise, Code"
          icon={Activity}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-500"
          trend={{ value: `${habitCompletionRate}% Today`, positive: habitCompletionRate > 60 }}
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
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span
                            className={`text-sm font-semibold block ${
                              isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
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

          {/* Upcoming Tasks & Calendar Preview */}
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
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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
              <span className="text-xs font-bold text-emerald-500">+12% vs last week</span>
            </div>

            <SVGLineChart data={trendData} height={160} color="#10b981" />
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
              <Link href="/habits" className="text-xs font-bold text-blue-500 hover:underline">
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
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isDone ? 'bg-amber-500 text-white' : 'border border-gray-300 dark:border-gray-600'
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
