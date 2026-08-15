# Phased TODO List: Career Prep Module Revamp

## Phase 1: Data Architecture & Store Enhancements
- [x] **1.1 Update `types/index.ts` Data Models**
  - [x] Define `SubjectTopicChecklist` (id, title, completed).
  - [x] Define `SubjectTopic` (id, title, description, difficulty, status, resources, checklist, notes, lastRevised).
  - [x] Define `SubjectPlan` (id, title, category, description, colorTheme, topics, createdAt, updatedAt).
  - [x] Extend `DSATopic` with `DSAPrimaryTopic` and individual problem interfaces (`leetcodeUrl`, `difficulty`, `needsRevision`, `solutionNotes`).

- [x] **1.2 Extend Zustand Store (`store/useCareerStore.ts`)**
  - [x] Add `subjectPlans: SubjectPlan[]` state.
  - [x] Add `addSubjectPlan(planData)` action.
  - [x] Add `updateSubjectPlan(id, updates)` action.
  - [x] Add `deleteSubjectPlan(id)` action.
  - [x] Add `addSubjectTopic(subjectId, topicData)` action.
  - [x] Add `toggleTopicChecklist(subjectId, topicId, checklistId)` action.
  - [x] Add `importPresetRoadmap(presetKey)` action.
  - [x] Add `toggleDSAProblem(topicId, problemId)` action.
  - [x] Add `toggleDSARevision(topicId, problemId)` action.

- [x] **1.3 Update API Sync (`app/api/career/route.ts` & `models/Career.ts`)**
  - [x] Update MongoDB schema payload to include `subjectPlans`.
  - [x] Ensure seamless offline state handling and sync fallback.

---

## Phase 2: Subject-Wise Study Plan Builder & Preset Roadmaps UI
- [x] **2.1 Build `SubjectPlanCard` & Study Reader Environment (`app/career/[subjectId]/page.tsx`)**
  - [x] Clean overview subject cards with title, category badge, overall progress bar, and "Open Study Reader" link.
  - [x] Dedicated Study Reader Page with sticky sidebar for topic navigation and active topic highlighting.
  - [x] Interactive topic checklists, status selectors, resource link chips, and topic notes reader.
  - [x] Sequential reading navigation (`Previous Topic` / `Next Topic`).

- [x] **2.2 Create Creation Modals (`components/career/AddSubjectModal.tsx` & `AddTopicModal.tsx`)**
  - [x] Modal to create custom subject (Title, Category, Color theme, Description).
  - [x] Modal to add custom topic under a subject with initial checklist items and links.

- [x] **2.3 Build One-Click Preset Curriculum Importer**
  - [x] Add preset roadmap data for **Frontend Masterclass** (FreeCodeCamp/ChaiCode inspired).
  - [x] Add preset roadmap data for **Backend & System Design** (Node.js/Microservices/DB).
  - [x] Add preset roadmap data for **CS Fundamentals Core Sheet** (OS, DBMS, Computer Networks).

---

## Phase 3: Enhanced DSA Problem Sheets & Task Integration
- [x] **3.1 Redesign DSA Tracker Tab (`app/career/page.tsx`)**
  - [x] Group by primary DSA categories (Arrays & Hashing, Two Pointers, Binary Search, Trees, Graphs, DP).
  - [x] Render individual problem rows with LeetCode external link, `Easy`/`Medium`/`Hard` badges, and completed status.
  - [x] Add "Needs Revision" toggle tag.

- [x] **3.2 Implement "Copy Problem to Task" Action**
  - [x] Integrate with `useTaskStore` (`addTask`).
  - [x] Enable one-click copying of any DSA problem or topic item directly into Orbit's **Today Task** module with category `"Career"`.

---

## Phase 4: Mobile Responsiveness, Polish & Verification
- [x] **4.1 Mobile Viewport Audit**
  - [x] Ensure subject cards, topic accordions, and DSA problem lists render without horizontal overflow on mobile screens.
  - [x] Optimize tab header scrollability for mobile screens (`no-scrollbar`).

- [x] **4.2 Complete CRUD & Confirmation Modal Integration**
  - [x] Complete Create, Read, Update, Delete operations for Subject Plans, Topics, DSA Sheets, Interview Q&As, and Job Applications.
  - [x] Integrated `ConfirmDeleteModal` across all delete actions to prevent accidental deletion.
  - [x] Run `npx tsc --noEmit` to verify type safety across all stores and pages (0 errors).
