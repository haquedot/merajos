'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Code2,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  Flame,
  Building,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { useCareerStore } from '../../store/useCareerStore';
import { JobApplication, JobStatus, InterviewTopic } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'interview' | 'dsa'>('jobs');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const {
    jobs,
    interviewTopics,
    dsaTopics,
    jobStatusFilter,
    dsaSearchQuery,
    addJob,
    updateJob,
    deleteJob,
    setJobStatusFilter,
    toggleInterviewChecklist,
    updateDSASolved,
    setDSASearchQuery,
  } = useCareerStore();

  // Form states for job app
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const filteredJobs = jobs.filter((j) => jobStatusFilter === 'all' || j.status === jobStatusFilter);

  const filteredDSA = dsaTopics.filter((d) =>
    d.name.toLowerCase().includes(dsaSearchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(dsaSearchQuery.toLowerCase())
  );

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    addJob({
      company: company.trim(),
      role: role.trim(),
      appliedDate: new Date().toISOString().split('T')[0],
      status,
      salary: salary.trim(),
      location: location.trim(),
      notes: notes.trim(),
    });

    setCompany('');
    setRole('');
    setIsJobModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <PageHeader
        icon={GraduationCap}
        iconBgColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        title="Career Prep & DSA Tracker"
        badgeText={`${jobs.length} Applications`}
        badgeVariant="emerald"
        subtitle="Manage job application pipeline, technical interview prep, and DSA practice"
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold w-full sm:w-auto justify-between shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${activeTab === 'jobs'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${activeTab === 'interview'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              Interview Prep
            </button>
            <button
              onClick={() => setActiveTab('dsa')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs shrink-0 ${activeTab === 'dsa'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              DSA Tracker
            </button>
          </div>
        }
      />

      {/* Tab 1: Job Applications Pipeline */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Job Applications Database
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Pipeline Stages</option>
                <option value="Applied">Applied</option>
                <option value="OA">Online Assessment (OA)</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

              <button
                onClick={() => setIsJobModalOpen(true)}
                className="btn-primary px-2 sm:px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className='hidden sm:inline'>
                  Add Application
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {job.company}
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                      {job.role}
                    </span>
                  </div>

                  <select
                    value={job.status}
                    onChange={(e) => updateJob(job.id, { status: e.target.value as JobStatus })}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <option value="Applied">Applied</option>
                    <option value="OA">OA</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{job.location}</span>
                  </div>
                </div>

                {job.notes && (
                  <p className="text-[11px] text-gray-400 italic bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    "{job.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                  <span>Applied: {job.appliedDate}</span>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interview Prep */}
      {activeTab === 'interview' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Core Technical Interview Curriculum
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviewTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {topic.category}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">
                    {topic.progress}% Mastered
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{topic.notes}</p>

                <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Key Mastery Checklist
                  </span>
                  {topic.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleInterviewChecklist(topic.id, item.id)}
                      className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-emerald-500"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${item.completed ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-gray-600'
                          }`}
                      >
                        {item.completed && '✓'}
                      </div>
                      <span className={item.completed ? 'line-through text-gray-400' : ''}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: DSA Tracker */}
      {activeTab === 'dsa' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Data Structures & Algorithms Tracker
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={dsaSearchQuery}
                onChange={(e) => setDSASearchQuery(e.target.value)}
                placeholder="Search DSA topics (DP, Graphs...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDSA.map((dsa) => {
              const totalSolved = dsa.easySolved + dsa.mediumSolved + dsa.hardSolved;
              const totalTarget = dsa.easyTotal + dsa.mediumTotal + dsa.hardTotal;
              const perc = Math.round((totalSolved / totalTarget) * 100);

              return (
                <div
                  key={dsa.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-[200px]">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {dsa.name}
                    </h3>
                    <span className="text-xs text-gray-400 block">{dsa.notes}</span>
                  </div>

                  {/* Solved pills */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold">
                      Easy: {dsa.easySolved}/{dsa.easyTotal}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs font-bold">
                      Med: {dsa.mediumSolved}/{dsa.mediumTotal}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold">
                      Hard: {dsa.hardSolved}/{dsa.hardTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${perc}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white w-10 text-right">
                      {perc}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Add Job Application">
        <form onSubmit={handleAddJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google / Stripe / Linear"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              >
                <option value="Applied">Applied</option>
                <option value="OA">OA</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Salary Estimate
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$160,000 - $200,000"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral contact, recruiter name, interview notes..."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsJobModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl text-xs"
            >
              Save Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
