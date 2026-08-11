# Research Module Redesign — Implementation TODOs

> Based on: `docs/research-module-redesign.md`  
> Total Tasks: 22 across 5 phases

---

## Phase 1 — Data Layer
> Goal: New types, DB model, API, and store — no UI yet.

- [ ] **1.1** `types/index.ts` — Remove `Paper`, `WritingSection`, `ResearchOverview`. Add `ResearchPaper`, `ResearchSection`, `ResearchSectionType`, `ResearchProject`, `ResearchStatus`, `PaperStatus` (extended with `'skimmed'`).

- [ ] **1.2** `models/Research.ts` — Rewrite Mongoose schema: `ResearchPaperSchema` → `ResearchSectionSchema` → `ResearchProjectSchema` → top-level `ResearchDocSchema` (keyed by userId, holds `projects[]`).

- [ ] **1.3** `app/api/research/route.ts` — Update `GET` to return `{ projects }`. Update `POST` to accept and upsert `{ projects }` array.

- [ ] **1.4** `store/useResearchStore.ts` — Full rewrite with new state shape:
  - State: `projects[]`, `activeProjectId`, `isLoading`
  - Actions: `addProject`, `updateProject`, `deleteProject`, `setActiveProject`
  - Actions: `addSection`, `updateSection`, `deleteSection`
  - Actions: `addPaper`, `updatePaper`, `deletePaper`, `togglePaperImportant`
  - Persist `activeProjectId` to `localStorage`

---

## Phase 2 — Project List UI
> Goal: `/research` page shows all projects as cards — same pattern as Career/Goals.

- [ ] **2.1** `app/research/page.tsx` — Rewrite as project card grid. Hook into `projects` and `isLoading`. Render `GridCardsSkeleton` while loading.

- [ ] **2.2** `components/research/ResearchProjectCard.tsx` — Card component showing: color accent strip, title, field badge, paper count, section count, status badge, progress bar. Action buttons: Open → `[projectId]` page, Edit, Delete.

- [ ] **2.3** `components/research/NewResearchProjectModal.tsx` — Uses `<Modal>`. Fields: title, description, field/domain, color picker, status. On submit calls `store.addProject()`.

---

## Phase 3 — Project Detail UI
> Goal: `/research/[projectId]` with section tabs and full paper management.

- [ ] **3.1** `app/research/[projectId]/page.tsx` — Dynamic route. Reads project from store by `projectId`. Renders: back button, project header, horizontal section tabs, active section content. Includes "+ Add Section" tab at the end.

- [ ] **3.2** `components/research/AddSectionModal.tsx` — Uses `<Modal>`. Lets user pick section type (Literature Review, Writing, Datasets, Algorithms, Diagrams, Notes, Custom) and provide a title. Calls `store.addSection()`.

- [ ] **3.3** `components/research/LiteratureReviewSection.tsx` — Top-level section container for `type = 'literature_review'`. Contains toolbar (search, status filter tabs, ⭐ important toggle, + Add Paper button) and renders `PaperCard[]` grid.

- [ ] **3.4** `components/research/PaperCard.tsx` — Individual paper card UI:
  - Star toggle (isImportant)
  - Status badge + inline status change dropdown
  - Title (bold), Authors • Year • Source
  - Summary (collapsible, italic)
  - Notes (smaller, gray)
  - Action bar: View PDF, Copy Citation, Edit, Delete, **Copy to Task**

- [ ] **3.5** `components/research/AddPaperModal.tsx` — Uses `<Modal>`. Fields: title, authors, year, source, PDF URL, DOI, status, isImportant toggle, summary, notes, citation, tags, reading time.

- [ ] **3.6** `components/research/EditPaperModal.tsx` — Same form as AddPaperModal but pre-filled. On submit calls `store.updatePaper()`.

- [ ] **3.7** `components/research/WritingProgressSection.tsx` — For `type = 'writing'`. Shows word-count input (current / target), progress bar, writing status selector. Calls `store.updateSection()`.

- [ ] **3.8** `components/research/GenericSection.tsx` — For `type = 'datasets' | 'algorithms' | 'diagrams' | 'notes' | 'custom'`. Renders a markdown-friendly textarea bound to `section.content`. Saves on blur.

---

## Phase 4 — Cross-Module Integration

- [ ] **4.1** `PaperCard.tsx` — Wire **"Copy to Task"** button:
  ```ts
  useTaskStore.getState().addTask({
    title: `Read: ${paper.title}`,
    category: 'Research',
    priority: paper.isImportant ? 'high' : 'medium',
    description: `${paper.summary}\n\n${paper.pdfUrl ?? ''}`.trim(),
    dueDate: todayStr,
    status: 'todo',
  });
  // Show toast: "Task added — Read: {title}"
  ```

- [ ] **4.2** `app/analytics/page.tsx` — Update research stats section to read from `projects[]` instead of old `overview` + `papers[]` flat structure. Compute: total papers across all projects, papers by status, active project count.

- [ ] **4.3** `app/page.tsx` (Dashboard) — Update any research-related stats widgets to use new store shape.

---

## Phase 5 — Cleanup

- [ ] **5.1** `types/index.ts` — Confirm all old Research types fully removed. Check no other file still imports `Paper`, `WritingSection`, or `ResearchOverview`.

- [ ] **5.2** `models/Paper.ts` — Delete standalone file (now unused after model consolidation).

- [ ] **5.3** `store/seedData.ts` — Remove `INITIAL_PAPERS` and any old Research seed references.

- [ ] **5.4** `database/dexie.ts` — Remove `papers` Dexie table if Research is now MongoDB-only (confirm no offline dependency on it first).

- [ ] **5.5** Run `npx tsc --noEmit` — verify 0 TypeScript errors across the full codebase.

---

## Quick Reference

| Phase | Tasks | Files Touched |
|-------|-------|--------------|
| 1 — Data Layer | 1.1–1.4 | `types/`, `models/`, `app/api/`, `store/` |
| 2 — Project List | 2.1–2.3 | `app/research/page.tsx`, 2 new components |
| 3 — Project Detail | 3.1–3.8 | 1 new page, 6 new components |
| 4 — Integration | 4.1–4.3 | `PaperCard`, `analytics`, `dashboard` |
| 5 — Cleanup | 5.1–5.5 | Remove + verify |
