'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Scale,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Mail,
  ArrowRight,
  LogIn,
  Layers,
  BarChart3,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { BRAND } from '../../lib/branding';
import { useGoogleAuth } from '../../providers/GoogleAuthProvider';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';

export const PublicAppOverviewBanner: React.FC = () => {
  const { session, signIn } = useGoogleAuth();

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner for Unauthenticated Visitors / Google Reviewers */}
      {!session && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-6"
        >
          {/* Subtle Grid Background Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{BRAND.name} Personal Productivity Platform</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Organize Tasks, Time-Block Schedules & Accelerate Productivity
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                Orbit is an intelligent personal productivity command center designed for developers, researchers, students, and professionals to plan daily time blocks, track habits, manage technical research notes, and synchronize Google Calendar events.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 relative z-10">
              <Button
                onClick={signIn}
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold gap-2 text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google</span>
              </Button>
              <Link href="/privacy" className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 text-xs px-6 py-3 rounded-2xl"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span>View Privacy Policy</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Module Pills Overview */}
          <div className="pt-4 border-t border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Task Management</span>
                <span className="text-[10px] text-indigo-200/60">Top 3 MITs & Priorities</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Google Calendar Sync</span>
                <span className="text-[10px] text-purple-200/60">Time Slot Allocation</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Technical Research</span>
                <span className="text-[10px] text-emerald-200/60">Papers & Markdown Notes</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Productivity Analytics</span>
                <span className="text-[10px] text-amber-200/60">Streak & Score Trends</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transparent Data Usage & OAuth Transparency Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Application Purpose & Data Transparency</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              How Orbit handles your personal productivity workflow and Google OAuth data
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold shrink-0">
            <Link
              href="/privacy"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/terms"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              1. Purpose of the Application
            </h3>
            <p>
              Orbit is a personal productivity and workspace management platform designed to help users plan their daily focus blocks, manage task backlogs, track habit streaks, structure technical research notes, and monitor DSA career milestones in one place.
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              2. Google Calendar API Usage
            </h3>
            <p>
              Orbit requests Google OAuth permissions (<code className="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 px-1 py-0.5 rounded text-[11px]">https://www.googleapis.com/auth/calendar</code>) to read and write event data. This allows tasks, time slots, and focus sessions scheduled in Orbit to automatically sync with your personal Google Calendar.
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              3. Data Protection & Limited Use
            </h3>
            <p>
              Your data is stored locally in your browser (IndexedDB) with optional encrypted cloud sync. We strictly adhere to Google API Limited Use Policy: we never sell, monetize, share, or use Google user data for advertising or AI training.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Verified Official Domain: <strong>orbit.merajulhaque.com</strong></span>
          </div>
          <a
            href="mailto:haquedot@gmail.com"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span>Support Email: haquedot@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};
