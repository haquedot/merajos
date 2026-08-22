'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  ShieldCheck,
  Scale,
  CheckSquare,
  Lock,
  Mail,
  Calendar as CalendarIcon,
} from 'lucide-react';

export function AboutOrbitComplianceCard() {
  return (
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
  );
}
