'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Server,
  UserCheck,
  Mail,
  FileText,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Scale,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { BRAND } from '../../lib/branding';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'introduction', label: '1. Introduction & Overview' },
    { id: 'information-collect', label: '2. Information We Collect' },
    { id: 'how-we-use', label: '3. How We Use Information' },
    { id: 'google-data', label: '4. Google API & OAuth Data' },
    { id: 'data-storage', label: '5. Storage & Security' },
    { id: 'data-sharing', label: '6. Data Sharing & Third Parties' },
    { id: 'user-rights', label: '7. Your Data Rights & Deletion' },
    { id: 'cookies-storage', label: '8. Cookies & Local Storage' },
    { id: 'updates', label: '9. Changes & Contact' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <PageHeader
        title={`${BRAND.name} Privacy Policy`}
        subtitle="We are committed to protecting your privacy and ensuring your personal productivity data remains secure, private, and under your control."
        icon={ShieldCheck}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/terms">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Scale className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Zero Data Selling</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We never sell, monetize, or rent your personal tasks, research, notes, or calendar data to third parties or advertisers.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Local & Sync Encryption</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Your data is stored safely in browser IndexedDB with optional end-to-end encrypted Cloudflare D1 synchronization.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Full User Control</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Export your data into JSON at any time or trigger full data erasure with a single click in your Settings dashboard.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Restricted API Access</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Google Workspace OAuth permissions are limited to read/write event access specifically requested by you for Calendar sync.
          </p>
        </motion.div>
      </div>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 sticky top-20 hidden lg:block p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Table of Contents
            </h4>
          </div>

          <nav className="space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-between ${activeSection === sec.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
              >
                <span className="truncate">{sec.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeSection === sec.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-700'}`} />
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Effective Date: August 16, 2026</span>
            </div>
            <p>Version 1.0.0 — Production Release</p>
          </div>
        </aside>

        {/* Legal Text Document */}
        <div className="lg:col-span-8 p-6 sm:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-10 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section id="introduction" className="space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 1</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Introduction & Overview
              </h2>
            </div>
            <p>
              Welcome to <strong>{BRAND.name}</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). {BRAND.name} is a modern, privacy-focused productivity platform built to manage daily tasks, weekly roadmaps, client projects, technical research, DSA career progression, and interactive calendar scheduling.
            </p>
            <p>
              This Privacy Policy explains how information is collected, processed, and safeguarded when you access or use {BRAND.name} via web browsers, progressive web app (PWA) installs, or API endpoints. By accessing {BRAND.name}, you agree to the collection and handling of information in accordance with this policy.
            </p>
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-500 space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Our Privacy Commitment
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                {BRAND.name} is architected around a local-first philosophy. Your personal workflow data belongs to you. We do not analyze your productivity logs for advertising, nor do we sell user data under any circumstances.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="information-collect" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 2</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Information We Collect
              </h2>
            </div>
            <p>
              To provide a seamless productivity environment across devices, we collect and process the following categories of information:
            </p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Account & Authentication Data:</strong> When you connect your Google Account, we receive basic profile credentials including your full name, email address, and profile picture URL.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">User Productivity Content:</strong> Tasks, subtasks, notes, project bugs, client invoices, DSA subject progress, habit completion logs, and custom research notes created within the application.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">Calendar Sync Data:</strong> Time slots, event titles, start/end dates, color tags, and meeting links synchronized through the Google Calendar integration.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 dark:text-white">System & Diagnostics Data:</strong> Anonymous telemetry, theme preferences (light/dark), layout configurations, and error reporting to ensure platform stability.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="how-we-use" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 3</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                How We Use Information
              </h2>
            </div>
            <p>
              We utilize collected data strictly to operate, maintain, and enhance the {BRAND.name} productivity environment:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Real-Time Synchronization</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Synchronize your task states, notes, and calendar events seamlessly between desktop browsers and mobile devices.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Daily Task Summary Emails</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Deliver scheduled daily productivity breakdown emails to your connected notification email address (configurable in Settings).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Analytics & Performance</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Calculate productivity streak counts, weekly retrospective completion scores, and time-block velocity metrics.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Platform Security</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Verify Google OAuth session tokens, prevent abuse, and enforce access control permissions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="google-data" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 4</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Google API & OAuth Limited Use Disclosure
              </h2>
            </div>
            <p>
              {BRAND.name}&apos;s integration with Google APIs (Google OAuth 2.0 and Google Calendar API) adheres strictly to the <strong>Google API Service User Data Policy</strong>, including the Limited Use requirements:
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                <span>We only request access to scopes necessary for calendar event viewing and editing (e.g. <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px]">https://www.googleapis.com/auth/calendar</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                <span>Google user data is not transferred to third parties unless necessary to provide or improve productivity features, or as required by law.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                <span>We do not use Google user data for serving advertisements, training AI models, or building user marketing profiles.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="data-storage" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 5</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Storage, Encryption & Data Security
              </h2>
            </div>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards to secure your personal data:
            </p>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                <Server className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Edge Infrastructure & Encryption</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Cloud database operations execute on Cloudflare Workers and D1 distributed databases. All traffic is encrypted in transit using TLS 1.3 and at rest with standard AES-256 encryption.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Offline-First Browser Cache</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Data is stored locally in your browser via IndexedDB and Zustand store hydration, allowing offline productivity access while safeguarding against internet disruptions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="data-sharing" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 6</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Data Sharing & Third-Party Service Providers
              </h2>
            </div>
            <p>
              We do not sell or rent your data. We share information only with trusted service providers necessary to deliver our services:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Google Cloud Platform & OAuth 2.0</span>
                  <span className="text-[11px] text-gray-400">Authentication & Calendar Synchronization</span>
                </div>
                <Badge variant="outline" size="sm">Auth Partner</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Cloudflare Workers & D1</span>
                  <span className="text-[11px] text-gray-400">Serverless Edge Hosting & Cloud Database</span>
                </div>
                <Badge variant="outline" size="sm">Infrastructure</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Cloudflare Email Service</span>
                  <span className="text-[11px] text-gray-400">Transactional Email Delivery & Daily Summaries</span>
                </div>
                <Badge variant="outline" size="sm">Email Dispatch</Badge>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="user-rights" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 7</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Your Data Rights, Export & Deletion
              </h2>
            </div>
            <p>
              Regardless of your jurisdiction, {BRAND.name} grants all users complete control over their personal information:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Data Portability (Export)
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  You can export your complete workspace database (tasks, goals, projects, notes) into a standard JSON file at any time via the Settings page.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-500" />
                  Right to Erasure (Delete)
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  You have the absolute right to purge all local storage, IndexedDB caches, and server records by requesting full data deletion in Settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="cookies-storage" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 8</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Cookies & Local Browser Storage
              </h2>
            </div>
            <p>
              {BRAND.name} uses minimal essential cookies and local browser storage mechanisms (IndexedDB & LocalStorage) solely for technical platform operations:
            </p>
            <ul className="space-y-1.5 pl-2 text-gray-600 dark:text-gray-400">
              <li>• <strong>Session Tokens:</strong> Secure HTTP-only cookies for maintaining authenticated login state.</li>
              <li>• <strong>Theme & UI Preferences:</strong> LocalStorage keys preserving light/dark mode and sidebar state.</li>
              <li>• <strong>Offline Cache:</strong> IndexedDB storing local state for offline access.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="updates" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 9</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Policy Updates & Contact Information
              </h2>
            </div>
            <p>
              We may update this Privacy Policy periodically to reflect platform enhancements or legal requirements. Material changes will be communicated via in-app banners or notification emails prior to becoming effective.
            </p>
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Have Questions Regarding Privacy?
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Reach out directly to our privacy compliance team for data requests or policy clarifications.
                </p>
              </div>
              <a
                href="mailto:haquedot@gmail.com"
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Privacy Team</span>
              </a>
            </div>
          </section>

          {/* Footer Back Link */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link href="/terms" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              <span>View Terms of Service</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
