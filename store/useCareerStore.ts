import { create } from 'zustand';
import { JobApplication, InterviewTopic, DSATopic, SubjectPlan, SubjectTopic } from '../types';
import { isUserAuthenticated, getAuthHeaders } from '../lib/authCheck';
import { PRESET_SUBJECT_PLANS, PRESET_INTERVIEW_TOPICS, PRESET_DSA_TOPICS } from '../lib/careerPresets';
import { SOFTWARE_ENGINEER_SEED_DATA } from '../lib/softwareEngineerSeed';

export type CareerTab = 'roadmaps' | 'dsa' | 'interview' | 'jobs';

interface CareerState {
  jobs: JobApplication[];
  interviewTopics: InterviewTopic[];
  dsaTopics: DSATopic[];
  subjectPlans: SubjectPlan[];
  isLoadingTab: boolean;
  loadedTabs: Record<CareerTab, boolean>;
  jobStatusFilter: string;
  dsaSearchQuery: string;
  sharedAccessMap: Record<string, 'owner' | 'view_only'>;
  sharedAccessError: { subjectId: string; message: string; planTitle: string } | null;

  // Store hydration & lazy loaders
  loadFromDB: () => Promise<void>;
  loadTabData: (tab: CareerTab, force?: boolean) => Promise<void>;
  loadSubjectPlanById: (subjectId: string) => Promise<void>;

  // Job Actions
  addJob: (job: Omit<JobApplication, 'id'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  setJobStatusFilter: (status: string) => void;

  // Interview Actions
  updateInterviewProgress: (id: string, progress: number) => Promise<void>;
  toggleInterviewChecklist: (topicId: string, checklistId: string) => Promise<void>;
  addInterviewChecklistItem: (topicId: string, task: string) => Promise<void>;
  deleteInterviewChecklistItem: (topicId: string, checklistId: string) => Promise<void>;
  addInterviewTopic: (category: string, notes?: string) => Promise<void>;
  updateInterviewTopic: (id: string, updates: Partial<InterviewTopic>) => Promise<void>;
  deleteInterviewTopic: (id: string) => Promise<void>;
  updateInterviewNotes: (id: string, notes: string) => Promise<void>;

  // DSA Actions
  updateDSASolved: (id: string, easy: number, medium: number, hard: number) => Promise<void>;
  adjustDSACount: (id: string, type: 'easy' | 'medium' | 'hard', delta: number) => Promise<void>;
  addDSATopic: (name: string, category?: string, easyTotal?: number, mediumTotal?: number, hardTotal?: number) => Promise<void>;
  updateDSATopic: (id: string, updates: Partial<DSATopic>) => Promise<void>;
  deleteDSATopic: (id: string) => Promise<void>;
  setDSASearchQuery: (query: string) => void;

  // Subject Plan Actions
  addSubjectPlan: (plan: Omit<SubjectPlan, 'id' | 'createdAt' | 'updatedAt' | 'topics'> & { topics?: SubjectTopic[] }) => Promise<void>;
  updateSubjectPlan: (id: string, updates: Partial<SubjectPlan>) => Promise<void>;
  deleteSubjectPlan: (id: string) => Promise<void>;
  addSubjectTopic: (subjectId: string, topic: Omit<SubjectTopic, 'id'>) => Promise<void>;
  updateSubjectTopic: (subjectId: string, topicId: string, updates: Partial<SubjectTopic>) => Promise<void>;
  deleteSubjectTopic: (subjectId: string, topicId: string) => Promise<void>;
  toggleTopicChecklist: (subjectId: string, topicId: string, checklistId: string) => Promise<void>;
  importPresetRoadmap: (presetId: string) => Promise<void>;
  seedSoftwareEngineerData: () => Promise<void>;

  resetCareer: () => void;
}

export const useCareerStore = create<CareerState>((set, get) => {
  const syncToDB = async (state: Partial<CareerState>) => {
    const authenticated = await isUserAuthenticated();
    if (!authenticated) return;
    const currentState = get();
    const payload = {
      jobs: state.jobs || currentState.jobs,
      interviewTopics: state.interviewTopics || currentState.interviewTopics,
      dsaTopics: state.dsaTopics || currentState.dsaTopics,
      subjectPlans: state.subjectPlans || currentState.subjectPlans,
    };

    try {
      const headers = await getAuthHeaders();
      await fetch('/api/career', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Failed to sync career to MongoDB API', err);
    }
  };

  return {
    jobs: [],
    interviewTopics: [],
    dsaTopics: [],
    subjectPlans: [],
    isLoadingTab: false,
    loadedTabs: {
      roadmaps: false,
      dsa: false,
      interview: false,
      jobs: false,
    },
    jobStatusFilter: 'all',
    dsaSearchQuery: '',
    sharedAccessMap: {},
    sharedAccessError: null,

    loadFromDB: async () => {
      const authenticated = await isUserAuthenticated();
      if (!authenticated) {
        set({ isLoadingTab: false });
        return;
      }

      set({ isLoadingTab: true });
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/career', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.career) {
            set({
              jobs: data.career.jobs || [],
              interviewTopics: data.career.interviewTopics || [],
              dsaTopics: data.career.dsaTopics || [],
              subjectPlans: data.career.subjectPlans || [],
              isLoadingTab: false,
              loadedTabs: {
                roadmaps: true,
                dsa: true,
                interview: true,
                jobs: true,
              },
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load career data from API', err);
      }
      set({ isLoadingTab: false });
    },

    // On-demand Tab Data Loader
    loadTabData: async (tab: CareerTab, force = false) => {
      const state = get();
      // Skip network call only if tab is already loaded AND we actually have populated data
      const hasData = state.subjectPlans.length > 0 || state.dsaTopics.length > 0 || state.interviewTopics.length > 0 || state.jobs.length > 0;
      if (!force && state.loadedTabs[tab] && hasData) return;

      set({ isLoadingTab: true });

      try {
        const authenticated = await isUserAuthenticated();
        if (!authenticated) {
          set((state) => ({
            isLoadingTab: false,
            loadedTabs: { ...state.loadedTabs, [tab]: true },
          }));
          return;
        }

        const headers = await getAuthHeaders();
        const res = await fetch('/api/career', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.career) {
            set((state) => ({
              jobs: data.career.jobs || state.jobs,
              interviewTopics: data.career.interviewTopics || state.interviewTopics,
              dsaTopics: data.career.dsaTopics || state.dsaTopics,
              subjectPlans: data.career.subjectPlans || state.subjectPlans,
              isLoadingTab: false,
              loadedTabs: {
                roadmaps: true,
                dsa: true,
                interview: true,
                jobs: true,
              },
            }));
            return;
          }
        }
      } catch (err) {
        console.warn(`Failed to load ${tab} data from API`, err);
      }

      set((state) => ({
        isLoadingTab: false,
        loadedTabs: { ...state.loadedTabs, [tab]: true },
      }));
    },

    loadSubjectPlanById: async (subjectId: string) => {
      set({ isLoadingTab: true, sharedAccessError: null });
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/career/${subjectId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.plan) {
            const existingPlans = get().subjectPlans;
            const exists = existingPlans.some((sp) => sp.id === data.plan.id);
            const updatedPlans = exists
              ? existingPlans.map((sp) => (sp.id === data.plan.id ? data.plan : sp))
              : [data.plan, ...existingPlans];

            set({
              subjectPlans: updatedPlans,
              isLoadingTab: false,
              sharedAccessMap: {
                ...get().sharedAccessMap,
                [subjectId]: data.access || 'owner',
              },
            });
            return;
          }
        } else if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          set({
            isLoadingTab: false,
            sharedAccessError: {
              subjectId,
              message: errorData.error || 'This subject plan is private.',
              planTitle: errorData.planTitle || 'Private Subject Plan',
            },
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to load subject plan by ID', err);
      }
      set({ isLoadingTab: false });
    },


    // Job Actions
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

    // Interview Actions
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
          const newProgress =
            updatedChecklist.length > 0
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

    addInterviewChecklistItem: async (topicId, taskTitle) => {
      const updatedTopics = get().interviewTopics.map((t) => {
        if (t.id === topicId) {
          const newItem = {
            id: `item-${Date.now()}`,
            task: taskTitle,
            completed: false,
          };
          const updatedChecklist = [...t.checklist, newItem];
          const completedCount = updatedChecklist.filter((c) => c.completed).length;
          const newProgress = Math.round((completedCount / updatedChecklist.length) * 100);

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

    deleteInterviewChecklistItem: async (topicId, checklistId) => {
      const updatedTopics = get().interviewTopics.map((t) => {
        if (t.id === topicId) {
          const updatedChecklist = t.checklist.filter((item) => item.id !== checklistId);
          const completedCount = updatedChecklist.filter((c) => c.completed).length;
          const newProgress =
            updatedChecklist.length > 0
              ? Math.round((completedCount / updatedChecklist.length) * 100)
              : 0;

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

    addInterviewTopic: async (category, notes = '') => {
      const newTopic: InterviewTopic = {
        id: `int-${Date.now()}`,
        category: category as any,
        progress: 0,
        notes,
        resources: [],
        checklist: [],
      };
      const updatedTopics = [newTopic, ...get().interviewTopics];
      set({ interviewTopics: updatedTopics });
      syncToDB({ interviewTopics: updatedTopics });
    },

    updateInterviewTopic: async (id, updates) => {
      const updatedTopics = get().interviewTopics.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ interviewTopics: updatedTopics });
      syncToDB({ interviewTopics: updatedTopics });
    },

    deleteInterviewTopic: async (id) => {
      const updatedTopics = get().interviewTopics.filter((t) => t.id !== id);
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

    // DSA Actions
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

    adjustDSACount: async (id, type, delta) => {
      const updatedDSA = get().dsaTopics.map((d) => {
        if (d.id === id) {
          if (type === 'easy') {
            const nextEasy = Math.max(0, Math.min(d.easyTotal, d.easySolved + delta));
            return { ...d, easySolved: nextEasy, lastRevised: new Date().toISOString().split('T')[0] };
          }
          if (type === 'medium') {
            const nextMed = Math.max(0, Math.min(d.mediumTotal, d.mediumSolved + delta));
            return { ...d, mediumSolved: nextMed, lastRevised: new Date().toISOString().split('T')[0] };
          }
          if (type === 'hard') {
            const nextHard = Math.max(0, Math.min(d.hardTotal, d.hardSolved + delta));
            return { ...d, hardSolved: nextHard, lastRevised: new Date().toISOString().split('T')[0] };
          }
        }
        return d;
      });

      set({ dsaTopics: updatedDSA });
      syncToDB({ dsaTopics: updatedDSA });
    },

    addDSATopic: async (name, category = 'Custom Sheet', easyTotal = 15, mediumTotal = 25, hardTotal = 10) => {
      const newDSA: DSATopic = {
        id: `dsa-${Date.now()}`,
        name,
        category,
        easySolved: 0,
        easyTotal,
        mediumSolved: 0,
        mediumTotal,
        hardSolved: 0,
        hardTotal,
        notes: 'Track problem solving progress',
        lastRevised: new Date().toISOString().split('T')[0],
      };
      const updatedDSA = [newDSA, ...get().dsaTopics];
      set({ dsaTopics: updatedDSA });
      syncToDB({ dsaTopics: updatedDSA });
    },

    updateDSATopic: async (id, updates) => {
      const updatedDSA = get().dsaTopics.map((d) => (d.id === id ? { ...d, ...updates } : d));
      set({ dsaTopics: updatedDSA });
      syncToDB({ dsaTopics: updatedDSA });
    },

    deleteDSATopic: async (id) => {
      const updatedDSA = get().dsaTopics.filter((d) => d.id !== id);
      set({ dsaTopics: updatedDSA });
      syncToDB({ dsaTopics: updatedDSA });
    },

    setDSASearchQuery: (query) => set({ dsaSearchQuery: query }),

    // Subject Plan Store Implementation
    addSubjectPlan: async (planData) => {
      const newPlan: SubjectPlan = {
        ...planData,
        id: `subject-${Date.now()}`,
        topics: planData.topics || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedPlans = [newPlan, ...get().subjectPlans];
      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    updateSubjectPlan: async (id, updates) => {
      const updatedPlans = get().subjectPlans.map((sp) =>
        sp.id === id ? { ...sp, ...updates, updatedAt: new Date().toISOString() } : sp
      );
      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    deleteSubjectPlan: async (id) => {
      const updatedPlans = get().subjectPlans.filter((sp) => sp.id !== id);
      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    addSubjectTopic: async (subjectId, topicData) => {
      const newTopic: SubjectTopic = {
        ...topicData,
        id: `topic-${Date.now()}`,
      };

      const updatedPlans = get().subjectPlans.map((sp) => {
        if (sp.id === subjectId) {
          return {
            ...sp,
            topics: [...sp.topics, newTopic],
            updatedAt: new Date().toISOString(),
          };
        }
        return sp;
      });

      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    updateSubjectTopic: async (subjectId, topicId, updates) => {
      const updatedPlans = get().subjectPlans.map((sp) => {
        if (sp.id === subjectId) {
          const updatedTopics = sp.topics.map((t) =>
            t.id === topicId ? { ...t, ...updates } : t
          );
          return {
            ...sp,
            topics: updatedTopics,
            updatedAt: new Date().toISOString(),
          };
        }
        return sp;
      });

      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    deleteSubjectTopic: async (subjectId, topicId) => {
      const updatedPlans = get().subjectPlans.map((sp) => {
        if (sp.id === subjectId) {
          const updatedTopics = sp.topics.filter((t) => t.id !== topicId);
          return {
            ...sp,
            topics: updatedTopics,
            updatedAt: new Date().toISOString(),
          };
        }
        return sp;
      });

      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    toggleTopicChecklist: async (subjectId, topicId, checklistId) => {
      const updatedPlans = get().subjectPlans.map((sp) => {
        if (sp.id === subjectId) {
          const updatedTopics = sp.topics.map((t) => {
            if (t.id === topicId) {
              const updatedChecklist = t.checklist.map((c) =>
                c.id === checklistId ? { ...c, completed: !c.completed } : c
              );
              const allCompleted = updatedChecklist.length > 0 && updatedChecklist.every((c) => c.completed);
              const anyCompleted = updatedChecklist.some((c) => c.completed);

              return {
                ...t,
                checklist: updatedChecklist,
                status: (allCompleted ? 'mastered' : anyCompleted ? 'in_progress' : 'todo') as any,
              };
            }
            return t;
          });

          return {
            ...sp,
            topics: updatedTopics,
            updatedAt: new Date().toISOString(),
          };
        }
        return sp;
      });

      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    importPresetRoadmap: async (presetId) => {
      const preset = PRESET_SUBJECT_PLANS.find((p) => p.id === presetId);
      if (!preset) return;

      const importedPlan: SubjectPlan = {
        ...preset,
        id: `subject-${Date.now()}`,
        title: `${preset.title} (Custom)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPlans = [importedPlan, ...get().subjectPlans];
      set({ subjectPlans: updatedPlans });
      syncToDB({ subjectPlans: updatedPlans });
    },

    seedSoftwareEngineerData: async () => {
      set({
        subjectPlans: SOFTWARE_ENGINEER_SEED_DATA.subjectPlans,
        dsaTopics: SOFTWARE_ENGINEER_SEED_DATA.dsaTopics,
        interviewTopics: SOFTWARE_ENGINEER_SEED_DATA.interviewTopics,
        jobs: SOFTWARE_ENGINEER_SEED_DATA.jobs,
        loadedTabs: {
          roadmaps: true,
          dsa: true,
          interview: true,
          jobs: true,
        },
      });
      syncToDB({
        subjectPlans: SOFTWARE_ENGINEER_SEED_DATA.subjectPlans,
        dsaTopics: SOFTWARE_ENGINEER_SEED_DATA.dsaTopics,
        interviewTopics: SOFTWARE_ENGINEER_SEED_DATA.interviewTopics,
        jobs: SOFTWARE_ENGINEER_SEED_DATA.jobs,
      });
    },

    resetCareer: () =>
      set({
        jobs: [],
        interviewTopics: [],
        dsaTopics: [],
        subjectPlans: [],
        loadedTabs: {
          roadmaps: false,
          dsa: false,
          interview: false,
          jobs: false,
        },
      }),
  };
});
