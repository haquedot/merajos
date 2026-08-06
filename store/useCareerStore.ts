import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JobApplication, InterviewTopic, DSATopic, JobStatus } from '../types';

interface CareerState {
  jobs: JobApplication[];
  interviewTopics: InterviewTopic[];
  dsaTopics: DSATopic[];
  jobStatusFilter: string;
  dsaSearchQuery: string;

  // Job Actions
  addJob: (job: Omit<JobApplication, 'id'>) => void;
  updateJob: (id: string, updates: Partial<JobApplication>) => void;
  deleteJob: (id: string) => void;
  setJobStatusFilter: (status: string) => void;

  // Interview Actions
  updateInterviewProgress: (id: string, progress: number) => void;
  toggleInterviewChecklist: (topicId: string, checklistId: string) => void;
  updateInterviewNotes: (id: string, notes: string) => void;

  // DSA Actions
  updateDSASolved: (id: string, easy: number, medium: number, hard: number) => void;
  setDSASearchQuery: (query: string) => void;

  resetCareer: () => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      jobs: [],
      interviewTopics: [],
      dsaTopics: [],
      jobStatusFilter: 'all',
      dsaSearchQuery: '',

      addJob: (jobData) => {
        const newJob: JobApplication = {
          ...jobData,
          id: `job-${Date.now()}`,
        };
        set((state) => ({ jobs: [newJob, ...state.jobs] }));
      },

      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        }));
      },

      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        }));
      },

      setJobStatusFilter: (status) => set({ jobStatusFilter: status }),

      updateInterviewProgress: (id, progress) => {
        set((state) => ({
          interviewTopics: state.interviewTopics.map((t) =>
            t.id === id ? { ...t, progress } : t
          ),
        }));
      },

      toggleInterviewChecklist: (topicId, checklistId) => {
        set((state) => ({
          interviewTopics: state.interviewTopics.map((t) => {
            if (t.id === topicId) {
              const updatedChecklist = t.checklist.map((item) =>
                item.id === checklistId ? { ...item, completed: !item.completed } : item
              );
              const completedCount = updatedChecklist.filter((c) => c.completed).length;
              const newProgress = updatedChecklist.length > 0
                ? Math.round((completedCount / updatedChecklist.length) * 100)
                : t.progress;

              return {
                ...t,
                checklist: updatedChecklist,
                progress: newProgress,
              };
            }
            return t;
          }),
        }));
      },

      updateInterviewNotes: (id, notes) => {
        set((state) => ({
          interviewTopics: state.interviewTopics.map((t) =>
            t.id === id ? { ...t, notes } : t
          ),
        }));
      },

      updateDSASolved: (id, easy, medium, hard) => {
        set((state) => ({
          dsaTopics: state.dsaTopics.map((d) =>
            d.id === id
              ? {
                  ...d,
                  easySolved: easy,
                  mediumSolved: medium,
                  hardSolved: hard,
                  lastRevised: new Date().toISOString().split('T')[0],
                }
              : d
          ),
        }));
      },

      setDSASearchQuery: (query) => set({ dsaSearchQuery: query }),

      resetCareer: () =>
        set({
          jobs: [],
          interviewTopics: [],
          dsaTopics: [],
        }),
    }),
    {
      name: 'meraj_os_career',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
