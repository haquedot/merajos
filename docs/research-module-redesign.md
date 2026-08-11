# Research Module Redesign — Implementation Plan

> **Status:** Ready for Review  
> **Created:** 2026-08-11  

---

## 1. Problem Statement

The current Research module is built around a **single, global research document** (one thesis, one set of papers, one set of writing sections). This is too rigid. The redesign treats research projects like **clients or goals** — a user can have multiple active research projects, each with its own independently-managed sections.

---

## 2. New Architecture Overview

```
Research Module
├── Research Project 1
│   ├── Section: Literature Review  ← papers management
│   ├── Section: Datasets
│   ├── Section: Algorithms
│   ├── Section: Writing Progress
│   └── Section: [User-Created]...
├── Research Project 2
└── Research Project N...

Literature Review Section
└── Paper Entry
    ├── Status: unread / reading / cited / skimmed / archived
    ├── ⭐ Important Flag
    ├── Summary + Notes
    ├── PDF / DOI link
    └── "Copy to Task" action
```

---

## 3. New TypeScript Types
**File:** `types/index.ts`

### 3.1 Remove (old flat types)
- `Paper`, `WritingSection`, `ResearchOverview`

### 3.2 Add

```typescript
// Paper status
export type PaperStatus = 'unread' | 'reading' | 'cited' | 'skimmed' | 'archived';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;            // e.g. "ArXiv", "IEEE", "NeurIPS 2024"
  pdfUrl?: string;
  doi?: string;
  status: PaperStatus;
  isImportant: boolean;      // ⭐ star/flag
  summary: string;           // user-written summary
  notes: string;             // raw highlights / personal notes
  citation: string;          // formatted citation string
  tags: string[];
  readingTimeMinutes: number;
  addedAt: string;           // ISO date string
}

// Section type discriminator
export type ResearchSectionType =
  | 'literature_review'
  | 'datasets'
  | 'algorithms'
  | 'diagrams'
  | 'writing'
  | 'notes'
  | 'custom';

export interface ResearchSection {
  id: string;
  type: ResearchSectionType;
  title: string;             // user-editable label
  description?: string;
  papers?: ResearchPaper[];  // for literature_review
  targetWords?: number;      // for writing
  currentWords?: number;     // for writing
  writingStatus?: 'not_started' | 'drafting' | 'reviewing' | 'completed';
  content?: string;          // for notes / custom free-form
  createdAt: string;
  order: number;             // for drag-sort
}

// Project status
export type ResearchStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface ResearchProject {
  id: string;
  title: string;
  description?: string;
  field?: string;            // e.g. "Machine Learning", "Bioinformatics"
  status: ResearchStatus;
  progress: number;          // 0–100, computed
  color?: string;            // card accent color
  sections: ResearchSection[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Zustand Store
**File:** `store/useResearchStore.ts` (full rewrite)

```typescript
interface ResearchState {
  projects: ResearchProject[];
  activeProjectId: string | null;
  isLoading: boolean;

  // Project CRUD
  loadFromDB: () => Promise<void>;
  addProject: (data: Pick<ResearchProject, 'title' | 'description' | 'field' | 'status' | 'color'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ResearchProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;

  // Section CRUD
  addSection: (projectId: string, section: Omit<ResearchSection, 'id' | 'createdAt' | 'order'>) => Promise<void>;
  updateSection: (projectId: string, sectionId: string, updates: Partial<ResearchSection>) => Promise<void>;
  deleteSection: (projectId: string, sectionId: string) => Promise<void>;

  // Paper CRUD (within a literature_review section)
  addPaper: (projectId: string, sectionId: string, paper: Omit<ResearchPaper, 'id' | 'addedAt'>) => Promise<void>;
  updatePaper: (projectId: string, sectionId: string, paperId: string, updates: Partial<ResearchPaper>) => Promise<void>;
  deletePaper: (projectId: string, sectionId: string, paperId: string) => Promise<void>;
  togglePaperImportant: (projectId: string, sectionId: string, paperId: string) => Promise<void>;

  resetResearch: () => void;
}
```

**Key behaviors:**
- `addProject` auto-creates **one default "Literature Review" section**.
- Every mutation calls `syncToDB` (POST full `projects` array — same pattern as Goals/Career).
- `activeProjectId` is persisted to `localStorage` to remember last-viewed project.
- `isLoading: true` on init → `false` after first fetch resolves (or auth fails).

---

## 5. MongoDB Model
**File:** `models/Research.ts` (full rewrite)

```typescript
const ResearchPaperSchema = new Schema({
  id: String, title: String, authors: String,
  year: Number, source: String, pdfUrl: String, doi: String,
  status: { type: String, enum: ['unread','reading','cited','skimmed','archived'], default: 'unread' },
  isImportant: { type: Boolean, default: false },
  summary: { type: String, default: '' },
  notes: { type: String, default: '' },
  citation: { type: String, default: '' },
  tags: [String],
  readingTimeMinutes: { type: Number, default: 30 },
  addedAt: String,
});

const ResearchSectionSchema = new Schema({
  id: String, type: String, title: String, description: String,
  papers: [ResearchPaperSchema],
  targetWords: Number, currentWords: Number, writingStatus: String,
  content: String,
  createdAt: String, order: { type: Number, default: 0 },
});

const ResearchProjectSchema = new Schema({
  id: String, title: String, description: String, field: String,
  status: { type: String, enum: ['active','paused','completed','archived'], default: 'active' },
  progress: { type: Number, default: 0 },
  color: String,
  sections: [ResearchSectionSchema],
  createdAt: String, updatedAt: String,
});

const ResearchDocSchema = new Schema({
  _id: { type: String, required: true },  // userId
  projects: [ResearchProjectSchema],
}, { timestamps: true, _id: false });
```

---

## 6. API Routes
**File:** `app/api/research/route.ts`

| Method | Body / Response | Behavior |
|--------|----------------|----------|
| `GET` | — → `{ projects: ResearchProject[] }` | Return all projects for auth user |
| `POST` | `{ projects }` → `{ ok: true }` | Full upsert of user's research document |

> Simple full-document upsert — same pattern as Goals/Career. No per-entity endpoints needed.

---

## 7. File Structure

```
app/
  research/
    page.tsx                          ← Project list (cards grid)
    [projectId]/
      page.tsx                        ← Project detail with section tabs

components/
  research/
    ResearchProjectCard.tsx           ← card for project list
    NewResearchProjectModal.tsx       ← create project modal
    AddSectionModal.tsx               ← section type picker + title
    LiteratureReviewSection.tsx       ← papers grid with all actions
    AddPaperModal.tsx                 ← add new paper form
    EditPaperModal.tsx                ← edit paper (pre-filled form)
    PaperCard.tsx                     ← individual paper card UI
    WritingProgressSection.tsx        ← writing word-count tracker
    GenericSection.tsx                ← datasets / diagrams / notes / custom
```

---

## 8. UI Breakdown

### 8.1 `app/research/page.tsx` — Project List

- Cards grid (same density as career/goals)
- Each card: color accent strip, title, field badge, stats (papers, sections), status, progress bar
- Actions: **Open** (→ detail page), Edit, Delete

### 8.2 `app/research/[projectId]/page.tsx` — Project Detail

- Back button → `/research`
- Project header: title, field, status badge, overall progress ring
- **Section tabs** — horizontal scrollable tabs, one per section
- **"+ Add Section"** tab at the end
- Active section renders its content component

### 8.3 `LiteratureReviewSection` — Paper Management

**Toolbar:**
- Search: title / authors / tags
- Status filter tabs: All | Unread | Reading | Cited | Skimmed | Archived
- Toggle: ⭐ Important Only
- Button: + Add Paper

**Paper Card:**
```
┌──────────────────────────────────────────────────────┐
│  ⭐ [toggle important]                [Status badge]  │
│  Title (bold, 2 lines max)                            │
│  Authors • Year • Source                              │
│  ─────────────────────────────────────────────────── │
│  📝 Summary (italic, collapsible after 2 lines)       │
│  💬 Notes (gray, smaller)                             │
│  ─────────────────────────────────────────────────── │
│  [View PDF ↗]  [Copy Citation]  [Edit]  [Delete]     │
│  [📋 Copy to Task]  [Change Status ▾]                 │
└──────────────────────────────────────────────────────┘
```

### 8.4 "Copy to Task" Action

When clicked on a paper:
1. Calls `useTaskStore.getState().addTask(...)` directly (no confirmation needed)
2. Task is pre-filled:
   - `title`: `"Read: {paper.title}"`
   - `category`: `Research`
   - `priority`: `high` if `isImportant`, else `medium`
   - `description`: paper summary (if any) + PDF link
   - `dueDate`: today
3. Shows a toast: *"Task added — 'Read: {title}'"*

---

## 9. Implementation Order

```
Phase 1 — Types & Data Layer
  [ ] 1. Update types/index.ts — add new types, remove old Research types
  [ ] 2. Rewrite models/Research.ts — new Mongoose schema
  [ ] 3. Update app/api/research/route.ts — GET/POST with new schema
  [ ] 4. Rewrite store/useResearchStore.ts — new state shape + all actions

Phase 2 — Project List UI
  [ ] 5. Rewrite app/research/page.tsx — project card grid + skeleton
  [ ] 6. Create components/research/ResearchProjectCard.tsx
  [ ] 7. Create components/research/NewResearchProjectModal.tsx

Phase 3 — Project Detail UI
  [ ] 8. Create app/research/[projectId]/page.tsx
  [ ] 9. Create components/research/AddSectionModal.tsx
  [ ] 10. Create components/research/LiteratureReviewSection.tsx
  [ ] 11. Create components/research/PaperCard.tsx
  [ ] 12. Create components/research/AddPaperModal.tsx
  [ ] 13. Create components/research/EditPaperModal.tsx
  [ ] 14. Create components/research/WritingProgressSection.tsx
  [ ] 15. Create components/research/GenericSection.tsx

Phase 4 — Cross-Module Integration
  [ ] 16. "Copy to Task" in PaperCard → useTaskStore.getState().addTask()
  [ ] 17. Update Analytics page to use new research schema
  [ ] 18. Update Skeleton loaders if new pages need different skeletons

Phase 5 — Cleanup
  [ ] 19. Remove old Paper types from types/index.ts
  [ ] 20. Remove/update old store references (WritingSection, ResearchOverview)
  [ ] 21. Remove models/Paper.ts (standalone file, now unused)
  [ ] 22. Remove seedData references to old Paper type
```

---

## 10. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Full-document POST upsert | Matches existing Goals/Career pattern. No complex partial-update API. |
| Sections as embedded array | Data locality — sections always accessed in project context. No joins. |
| `activeProjectId` in store (not URL) | List page is stateful without URL coupling. Detail page uses `[projectId]` route param. |
| Default LR section on create | Reduces friction — most users start with literature review. |
| Direct `useTaskStore` call | No round-trip needed for "Copy to Task" — instant task creation with toast. |
| No Dexie for research | Current research was never in Dexie. MongoDB-only + Zustand cache. Offline support = future phase. |

---

## 11. Open Questions — Please Confirm Before Implementation

> [!IMPORTANT]
> Answers to these will shape Phase 3 implementation.

1. **Writing sections** — Should these remain simple word-count trackers, or become a richer editor (markdown/block-based like Notion)?
2. **Diagrams / Datasets sections** — What should these contain? File upload links? Tables with rows? Or just free-form notes?
3. **Routing** — Project detail as separate route `/research/[projectId]` (recommended) **or** in-page slide-in drawer?
4. **"Copy to Task"** — Immediate creation with toast (recommended) **or** open a pre-filled QuickAddModal for confirmation first?
5. **Citation import** — Should there be a way to paste a DOI / ArXiv URL and auto-fill paper metadata, or is manual entry enough for now?
