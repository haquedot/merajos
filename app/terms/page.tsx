'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scale,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Users,
  Sparkles,
  Clock,
  ChevronRight,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Zap,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { BRAND } from '../../lib/branding';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'acceptance', label: '1. Acceptance & Eligibility' },
    { id: 'description', label: '2. Description of Services' },
    { id: 'user-accounts', label: '3. Accounts & Responsibilities' },
    { id: 'content-ownership', label: '4. Content Ownership' },
    { id: 'acceptable-use', label: '5. Acceptable Use Policy' },
    { id: 'service-availability', label: '6. Service Availability & Disclaimers' },
    { id: 'limitation-liability', label: '7. Limitation of Liability' },
    { id: 'termination', label: '8. Termination & Suspension' },
    { id: 'governing-law', label: '9. Governing Law & Disputes' },
    { id: 'amendments', label: '10. Amendments & Contact' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <PageHeader
        title={`${BRAND.name} Terms of Service`}
        subtitle="Please review these terms governing your access to and use of the Orbit personal productivity command center platform."
        icon={Scale}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">100% Content Ownership</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            You retain complete, exclusive ownership of all tasks, notes, goals, research, and data created on {BRAND.name}.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Fair Personal Use</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Use {BRAND.name} for individual productivity, career progression, client tracking, and research without hidden limits.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Offline & Edge Reliability</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Powered by browser IndexedDB local caching and Cloudflare Workers global serverless edge infrastructure.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">No Malicious Conduct</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Users must not attempt to reverse engineer API endpoints, disrupt service integrity, or distribute malicious payloads.
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
          <section id="acceptance" className="space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 1</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Acceptance of Terms & Eligibility
              </h2>
            </div>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot; or &quot;you&quot;) and <strong>{BRAND.name}</strong> (&quot;Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By signing in, accessing, or using {BRAND.name} via web browsers or mobile Progressive Web Application (PWA) packages, you confirm that you have read, understood, and agreed to be bound by these Terms and our <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Privacy Policy</Link>. If you do not agree to these Terms, you must immediately discontinue use of the platform.
            </p>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-500 space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Age Requirement
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400">
                You must be at least 13 years of age (or the legal age of majority in your jurisdiction) to create an account and use {BRAND.name}.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="description" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 2</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Description of Platform Services
              </h2>
            </div>
            <p>
              {BRAND.name} provides a modular, all-in-one productivity suite featuring:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Task & Goal Management</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Daily focus time blocks, priority matrices, subtask completion, and long-term goal tracking.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Interactive Calendar & Google Sync</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Google Calendar OAuth integration, event creation, time slot allocation, and agenda scheduling.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Research & Notes Command Center</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Structured technical research workspaces, markdown notes, category filters, and quick capture modals.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white">Career, DSA & Client Tracking</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  DSA topic checklists, job application pipelines, client bug tracking, and invoice status management.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="user-accounts" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 3</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                User Accounts & Security Responsibilities
              </h2>
            </div>
            <p>
              Authentication on {BRAND.name} is handled via Google OAuth 2.0. You are responsible for maintaining the security of your Google account credentials and for all activities occurring under your account session.
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You agree to notify us immediately of any unauthorized access or security breach involving your account.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Guest mode data is persisted locally in browser memory (IndexedDB) and may be cleared if browser storage is wiped.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="content-ownership" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 4</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                User Content & Intellectual Property Rights
              </h2>
            </div>
            <p>
              <strong>You retain 100% ownership</strong> of all content, text, notes, project data, client details, and materials that you submit or generate within {BRAND.name} (&quot;User Content&quot;).
            </p>
            <p>
              By using the platform, you grant {BRAND.name} a limited, non-exclusive, royalty-free license solely to host, store, process, and display your User Content to the extent necessary to deliver productivity services to you.
            </p>
            <p>
              The {BRAND.name} brand, application interface, visual components, source code, logos, and trademarks remain the exclusive intellectual property of {BRAND.name}.
            </p>
          </section>

          {/* Section 5 */}
          <section id="acceptable-use" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 5</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Acceptable Use Policy & Prohibited Conduct
              </h2>
            </div>
            <p>
              When accessing or using {BRAND.name}, you agree NOT to engage in any of the following prohibited activities:
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  Attempting to bypass authentication security, perform unauthorized vulnerability probing, or flood API endpoints.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  Using the service to store or transmit illegal content, malware, spam payloads, or infringing material.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  Reverse engineering, decompiling, or attempting to derive backend source logic outside open repositories.
                </span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="service-availability" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 6</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Service Availability, Updates & Disclaimers
              </h2>
            </div>
            <p>
              We strive to provide continuous uptime via Cloudflare&apos;s global edge network. However, services are provided on an <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express or implied.
            </p>
            <p>
              We reserve the right to modify, update, or temporarily pause features for scheduled maintenance or performance upgrades without prior liability.
            </p>
          </section>

          {/* Section 7 */}
          <section id="limitation-liability" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 7</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Limitation of Liability
              </h2>
            </div>
            <p>
              To the maximum extent permitted by applicable law, in no event shall {BRAND.name}, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, profits, or goodwill, arising out of your use of or inability to use the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section id="termination" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 8</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Termination & Account Discontinuation
              </h2>
            </div>
            <p>
              You may terminate your account and discontinue use of {BRAND.name} at any time by exporting your data and requesting account deletion in the Settings panel. We reserve the right to suspend accounts that violate our Acceptable Use Policy.
            </p>
          </section>

          {/* Section 9 */}
          <section id="governing-law" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 9</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Governing Law & Dispute Resolution
              </h2>
            </div>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of applicable jurisdictions, without regard to its conflict of law principles. Any legal action or proceeding shall be resolved through good-faith informal negotiation or arbitration.
            </p>
          </section>

          {/* Section 10 */}
          <section id="amendments" className="space-y-3 scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Section 10</Badge>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Amendments & Contact Information
              </h2>
            </div>
            <p>
              We reserve the right to update these Terms at any time. Continued use of {BRAND.name} after effective updates constitutes your agreement to the revised Terms.
            </p>
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Questions Regarding Terms of Service?
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Contact our support team for clarifications or questions about these terms.
                </p>
              </div>
              <a
                href="mailto:haquedot@gmail.com"
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Legal Support</span>
              </a>
            </div>
          </section>

          {/* Footer Back Link */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link href="/privacy" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              <span>View Privacy Policy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
