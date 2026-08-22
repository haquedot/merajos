# Orbit Personalization Implementation Plan

> **Blueprint Reference:** Derived directly from [`docs/PERSONALIZATION_ANALYSIS.md`](file:///e:/meraj-os/docs/PERSONALIZATION_ANALYSIS.md).  
> **Goal:** Incrementally transform Orbit into an adaptive, privacy-first, local-first **Personal Productivity Operating System**.

---

## 🏗️ Phase 0: Architectural Foundations & Domain Types (P0 — Required Base)

> **Goal:** Establish core TypeScript interfaces, Mongoose database schemas, and client state stores for personalization.

- [x] **0.1 Create Personalization Domain Types (`lib/personalization/types/`)**
  - [x] Create `lib/personalization/types/preferences.ts` (`UserPreferences` & settings interfaces).
  - [x] Create `lib/personalization/types/context.ts` (`CurrentContext` & `WorkloadCapacityModel` interfaces).
  - [x] Create `lib/personalization/types/signals.ts` (`DerivedSignal` & `BehaviorEvent` interfaces).
  - [x] Create `lib/personalization/types/recommendations.ts` (`Recommendation` & `TaskScoreFactor` interfaces).

- [x] **0.2 Database & API Foundation**
  - [x] Create `models/UserPreferences.ts` Mongoose schema with `userId` and `userEmail` indexing.
  - [x] Create `models/DerivedSignal.ts` Mongoose schema with unique compound index `{ userId: 1, signalKey: 1 }`.
  - [x] Create API endpoint `/api/personalization/preferences` (GET & PATCH) with `verifyAuth` session checking.

- [x] **0.3 Client State Infrastructure**
  - [x] Create `store/usePersonalizationStore.ts` Zustand store to hold live context and active recommendations.
  - [x] Extend `database/dexie.ts` Dexie database to support local `userPreferences`, `derivedSignals`, and `behaviorEvents` stores.

---

## 🎯 Phase 1: Deterministic Today Task Scoring (P0 — Core Productivity)

> **Goal:** Build pure, explainable task ranking logic for Today's Focus tasks without relying on external AI.

- [x] **1.1 Task Candidate & Constraint Evaluation**
  - [x] Implement `lib/personalization/constraints/constraintEvaluator.ts` to filter out blocked dependencies or tasks exceeding daily capacity.

- [x] **1.2 Dynamic Task Scorer (`lib/personalization/scoring/taskScorer.ts`)**
  - [x] Implement scoring factors ($P$ Priority, $G$ Goal Alignment, $U$ Deadline Urgency, $C$ Slot Affinity, $CTX$ Context Fit, $D$ Deferral Penalty).
  - [x] Return human-readable `TaskScoreFactor[]` array for transparency.

- [x] **1.3 Decision Engine (`lib/personalization/decisions/decisionEngine.ts`)**
  - [x] Combine candidates, constraints, and scoring to generate top 3 recommended MITs for Today.

- [x] **1.4 UI Integration on Today View (`app/today/page.tsx`)**
  - [x] Add **Smart MIT Recommendation Card** displaying explainable reasons (e.g., *"Aligns with SDE-1 Goal & high morning velocity"*).
  - [x] Provide one-click *"Set as MIT"* action button.

---

## 📊 Phase 2: Event Logging & Confidence Engine (P1 — Behavioral Signals)

> **Goal:** Track operational user actions locally and compute statistical signal confidence with sample-size safeguards and recency decay.

- [x] **2.1 Behavioral Event Logger (`lib/personalization/signals/eventLogger.ts`)**
  - [x] Add Dexie store `behaviorEvents` (60-day buffer retention).
  - [x] Log `TASK_COMPLETED`, `TASK_POSTPONED`, `FOCUS_SESSION_COMPLETED`, and `HABIT_CHECKED` events.

- [x] **2.2 Signal Aggregator & Confidence Engine (`lib/personalization/signals/signalAggregator.ts`)**
  - [x] Compute sample size $N$ and apply minimum threshold ($N_{\text{min}} = 10$).
  - [x] Implement 30-day exponential half-life recency decay ($W(t) = e^{-\lambda \cdot \Delta t}$).
  - [x] Derive category time-slot completion ratios (`career_morning_completion_affinity`, etc.).

---

## ⚡ Phase 3: Adaptive Today & Focus Mode (P1 — Context & Workload)

> **Goal:** Adapt daily timeline recommendations, focus timer defaults, and workload warnings based on active context.

- [x] **3.1 Workload Capacity Engine (`lib/personalization/context/contextBuilder.ts`)**
  - [x] Calculate total scheduled hours vs sustainable capacity (5.5h) and max threshold (7.0h).
  - [x] Render **Workload Capacity Warning** banner (`WorkloadWarningCard.tsx`) on Today page when scheduled work exceeds 7.0h.

- [x] **3.2 Focus Duration Optimization**
  - [x] Pre-fill Focus Card timer duration with user's preferred focus length (e.g., 45m).

- [x] **3.3 Recommendation Feedback Loop**
  - [x] Track recommendation actions (`Accepted`, `Dismissed`, `Rejected`).
  - [x] Adjust signal weights (+0.05 on accept, -0.20 on reject with 30-day suppression).

---

## 🛠️ Phase 4: Transparency & User Control Panel (P1 — Privacy & Trust)

> **Goal:** Provide full user visibility and control over learned workflow patterns in `/settings`.

- [x] **4.1 "What Orbit Knows About Me" UI (`app/settings/page.tsx`)**
  - [x] Display active learned patterns (e.g., Peak Focus Slot, Average Focus Duration, Target Role).
  - [x] Show sample size and confidence badges (High / Medium / Low).

- [x] **4.2 User Control Buttons**
  - [x] Add toggle switches for learning categories (Tasks, Focus Sessions, Habits).
  - [x] Add single-click **"Reset All Learned Behavioral Data"** button.

---

## 🔗 Phase 5: Cross-Module Intelligence (P2 — Unified System)

> **Goal:** Connect Goals, Career, Research, and Habits into a synchronized feedback loop.

- [x] **5.1 Career & Goal Alignment (`lib/personalization/crossModule/careerIntelligence.ts`)**
  - [x] Prioritize DSA topics matching user's target role.
  - [x] Highlight stale DSA topics with no practice in >7 days.

- [x] **5.2 Research Hub Stagnation Warnings (`lib/personalization/crossModule/researchIntelligence.ts`)**
  - [x] Alert user when literature review for active thesis projects has stalled (>7 days without paper read).

---

## 🤖 Phase 6: Optional AI Layer (P3 — Future Expansion)

> **Goal:** Introduce optional natural language planning assistance on top of the deterministic foundation.

- [x] **6.1 Natural Language Daily Planning Assist (`lib/personalization/ai/plannerAssist.ts`)**
  - [x] Context-aware AI prompt builder to parse natural language inputs into structured task recommendations.
- [x] **6.2 AI Weekly Review Summarizer (`lib/personalization/ai/weeklySummarizer.ts`)**
  - [x] Generate weekly productivity reflections using aggregated snapshot logs.

---

## 📈 Implementation Progress Checklist

| Phase | Description | Priority | Status |
| :--- | :--- | :---: | :---: |
| **Phase 0** | Architectural Foundations & Domain Types | **P0** | ✅ Completed |
| **Phase 1** | Deterministic Today Task Scoring | **P0** | ✅ Completed |
| **Phase 2** | Event Logging & Confidence Engine | **P1** | ✅ Completed |
| **Phase 3** | Adaptive Today & Focus Mode | **P1** | ✅ Completed |
| **Phase 4** | Transparency & User Control Panel | **P1** | ✅ Completed |
| **Phase 5** | Cross-Module Intelligence | **P2** | ✅ Completed |
| **Phase 6** | Optional AI Layer | **P3** | ✅ Completed |
