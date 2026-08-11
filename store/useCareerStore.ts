import { create } from 'zustand';
import { JobApplication, InterviewTopic, DSATopic } from '../types';
import { isUserAuthenticated } from '../lib/authCheck';

interface CareerState {
  jobs: JobApplication[];
  interviewTopics: InterviewTopic[];
  dsaTopics: DSATopic[];
  isLoading: boolean;
  jobStatusFilter: string;
  dsaSearchQuery: string;

  loadFromDB: () => Promise<void>;
  addJob: (job: Omit<JobApplication, 'id'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  setJobStatusFilter: (status: string) => void;

  updateInterviewProgress: (id: string, progress: number) => Promise<void>;
  toggleInterviewChecklist: (topicId: string, checklistId: string) => Promise<void>;
  updateInterviewNotes: (id: string, notes: string) => Promise<void>;

  updateDSASolved: (id: string, easy: number, medium: number, hard: number) => Promise<void>;
  setDSASearchQuery: (query: string) => void;

  resetCareer: () => void;
}

export const useCareerStore = create<CareerState>((set, get) => {
  if (typeof window !== 'undefined') {
    isUserAuthenticated().then((authenticated) => {
      if (!authenticated) {
        set({ isLoading: false });
        return;
      }
      fetch('/api/career')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.career) {
            set({
              jobs: data.career.jobs || [],
              interviewTopics: data.career.interviewTopics || [],
              dsaTopics: data.career.dsaTopics || [],
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        })
        .catch((err) => {
          console.warn('[MongoDB CareerSync] Offline or API unreachable', err);
          set({ isLoading: false });
        });
    });
  }

  const syncToDB = async (state: Partial<CareerState>) => {
    const authenticated = await isUserAuthenticated();
    if (!authenticated) return;
    const currentState = get();
    const payload = {
      jobs: state.jobs || currentState.jobs,
      interviewTopics: state.interviewTopics || currentState.interviewTopics,
      dsaTopics: state.dsaTopics || currentState.dsaTopics,
    };

    fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Failed to sync career to MongoDB API', err));
  };

  return {
    jobs: [],
    interviewTopics: [],
    dsaTopics: [],
    isLoading: true,
    jobStatusFilter: 'all',
    dsaSearchQuery: '',

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) return;
      try {
        const res = await fetch('/api/career');
        if (!res.ok) return;
        const data = await res.json();
        if (data.career) {
          set({
            jobs: data.career.jobs || [],
            interviewTopics: data.career.interviewTopics || [],
            dsaTopics: data.career.dsaTopics || [],
          });
        }
      } catch (err) {
        console.warn('Failed to load career from MongoDB API', err);
      }
    },

    addJob: async (jobData) => {
      const newJob: JobApplication = {
        ...jobData,
        id: `job-${Date.now()}`,
      };
      const updatedJobs = [newJob, ...get().jobs];
      set({ jobs: updatedJobs });
      syncToDB({ jobs: updatedJobs });
    },

    updateJob: async (id, updates) => {
      const updatedJobs = get().jobs.map((j) => (j.id === id ? { ...j, ...updates } : j));
      set({ jobs: updatedJobs });
      syncToDB({ jobs: updatedJobs });
    },

    deleteJob: async (id) => {
      const updatedJobs = get().jobs.filter((j) => j.id !== id);
      set({ jobs: updatedJobs });
      syncToDB({ jobs: updatedJobs });
    },

    setJobStatusFilter: (status) => set({ jobStatusFilter: status }),

    updateInterviewProgress: async (id, progress) => {
      const updatedTopics = get().interviewTopics.map((t) =>
        t.id === id ? { ...t, progress } : t
      );
      set({ interviewTopics: updatedTopics });
      syncToDB({ interviewTopics: updatedTopics });
    },

    toggleInterviewChecklist: async (topicId, checklistId) => {
      const updatedTopics = get().interviewTopics.map((t) => {
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
      });

      set({ interviewTopics: updatedTopics });
      syncToDB({ interviewTopics: updatedTopics });
    },

    updateInterviewNotes: async (id, notes) => {
      const updatedTopics = get().interviewTopics.map((t) =>
        t.id === id ? { ...t, notes } : t
      );
      set({ interviewTopics: updatedTopics });
      syncToDB({ interviewTopics: updatedTopics });
    },

    updateDSASolved: async (id, easy, medium, hard) => {
      const updatedDSA = get().dsaTopics.map((d) =>
        d.id === id
          ? {
              ...d,
              easySolved: easy,
              mediumSolved: medium,
              hardSolved: hard,
              lastRevised: new Date().toISOString().split('T')[0],
            }
          : d
      );

      set({ dsaTopics: updatedDSA });
      syncToDB({ dsaTopics: updatedDSA });
    },

    setDSASearchQuery: (query) => set({ dsaSearchQuery: query }),

    resetCareer: () => set({ jobs: [], interviewTopics: [], dsaTopics: [] }),
  };
});
