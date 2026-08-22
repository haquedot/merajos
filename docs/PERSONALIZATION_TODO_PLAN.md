# Orbit Personalization Implementation Plan

> **Blueprint Reference:** Derived directly from [`docs/PERSONALIZATION_ANALYSIS.md`](file:///e:/meraj-os/docs/PERSONALIZATION_ANALYSIS.md).  
> **Goal:** Incrementally transform Orbit into an adaptive, privacy-first, local-first **Personal Productivity Operating System**.

---

## 🏗️ Phase 0: Architectural Foundations & Domain Types (P0 — Required Base)

> **Goal:** Establish core TypeScript interfaces, Mongoose database schemas, and client state stores for personalization.

- [ ] **0.1 Create Personalization Domain Types (`lib/personalization/types/`)**
  - [ ] Create `lib/personalization/types/preferences.ts` (`UserPreferences` & settings interfaces).
  - [ ] Create `lib/personalization/types/context.ts` (`CurrentContext` & `WorkloadCapacityModel` interfaces).
  - [ ] Create `lib/personalization/types/signals.ts` (`DerivedSignal` & `BehaviorEvent` interfaces).
  - [ ] Create `lib/personalization/types/recommendations.ts` (`Recommendation` & `TaskScoreFactor` interfaces).

- [ ] **0.2 Database & API Foundation**
  - [ ] Create `models/UserPreferences.ts` Mongoose schema with `userId` and `userEmail` indexing.
  - [ ] Create `models/DerivedSignal.ts` Mongoose schema with unique compound index `{ userId: 1, signalKey: 1 }`.
  - [ ] Create API endpoint `/api/personalization/preferences` (GET & PATCH) with `verifyAuth` session checking.

- [ ] **0.3 Client State Infrastructure**
  - [ ] Create `store/usePersonalizationStore.ts` Zustand store to hold live context and active recommendations.
  - [ ] Extend `lib/db.ts` Dexie database to support local `user_preferences` and `derived_signals` stores.

---

## 🎯 Phase 1: Deterministic Today Task Scoring (P0 — Core Productivity)

> **Goal:** Build pure, explainable task ranking logic for Today's Focus tasks without relying on external AI.

- [ ] **1.1 Task Candidate & Constraint Evaluation**
  - [ ] Implement `lib/personalization/constraints/constraintEvaluator.ts` to filter out blocked dependencies or tasks exceeding daily capacity.

- [ ] **1.2 Dynamic Task Scorer (`lib/personalization/scoring/taskScorer.ts`)**
  - [ ] Implement scoring factors ($P$ Priority, $G$ Goal Alignment, $U$ Deadline Urgency, $C$ Slot Affinity, $CTX$ Context Fit, $D$ Deferral Penalty).
  - [ ] Return human-readable `TaskScoreFactor[]` array for transparency.

- [ ] **1.3 Decision Engine (`lib/personalization/decisions/decisionEngine.ts`)**
  - [ ] Combine candidates, constraints, and scoring to generate top 3 recommended MITs for Today.

- [ ] **1.4 UI Integration on Today View (`app/today/page.tsx`)**
  - [ ] Add **Smart MIT Recommendation Card** displaying explainable reasons (e.g., *"Aligns with SDE-1 Goal & high morning velocity"*).
  - [ ] Provide one-click *"Set as MIT"* action button.

---

## 📊 Phase 2: Event Logging & Confidence Engine (P1 — Behavioral Signals)

> **Goal:** Track operational user actions locally and compute statistical signal confidence with sample-size safeguards and recency decay.

- [ ] **2.1 Behavioral Event Logger (`lib/personalization/signals/eventLogger.ts`)**
  - [ ] Add Dexie store `behavior_events` (60-day buffer retention).
  - [ ] Log `TASK_COMPLETED`, `TASK_POSTPONED`, `FOCUS_SESSION_COMPLETED`, and `HABIT_CHECKED` events.

- [ ] **2.2 Signal Aggregator & Confidence Engine (`lib/personalization/signals/signalAggregator.ts`)**
  - [ ] Compute sample size $N$ and apply minimum threshold ($N_{\text{min}} = 10$).
  - [ ] Implement 30-day exponential half-life recency decay ($W(t) = e^{-\lambda \cdot \Delta t}$).
  - [ ] Derive category time-slot completion ratios (`career_morning_completion_affinity`, etc.).

---

## ⚡ Phase 3: Adaptive Today & Focus Mode (P1 — Context & Workload)

> **Goal:** Adapt daily timeline recommendations, focus timer defaults, and workload warnings based on active context.

- [ ] **3.1 Workload Capacity Engine (`lib/personalization/context/contextBuilder.ts`)**
  - [ ] Calculate total scheduled hours vs sustainable capacity (5.5h) and max threshold (7.0h).
  - [ ] Render **Workload Balancing Warning** banner on Today page when scheduled work exceeds 7.0h.

- [ ] **3.2 Focus Duration Optimization**
  - [ ] Pre-fill Focus Card timer duration with user's preferred or historically optimal focus length (e.g., 45m).

- [ ] **3.3 Recommendation Feedback Loop**
  - [ ] Track recommendation actions (`Accepted`, `Dismissed`, `Rejected`).
  - [ ] Adjust signal weights (+0.05 on accept, -0.20 on reject with 30-day suppression).

---

## 🛠️ Phase 4: Transparency & User Control Panel (P1 — Privacy & Trust)

> **Goal:** Provide full user visibility and control over learned workflow patterns in `/settings`.

- [ ] **4.1 "What Orbit Knows About Me" UI (`app/settings/page.tsx`)**
  - [ ] Display active learned patterns (e.g., Peak Focus Slot, Average Focus Duration, Workload Capacity).
  - [ ] Show sample size and confidence badges (High / Medium / Low).

- [ ] **4.2 User Control Buttons**
  - [ ] Add toggle switches for learning categories (Tasks, Focus Sessions, Habits).
  - [ ] Add single-click **"Reset All Learned Behavioral Data"** button (`POST /api/personalization/reset`).

---

## 🔗 Phase 5: Cross-Module Intelligence (P2 — Unified System)

> **Goal:** Connect Goals, Career, Research, and Habits into a synchronized feedback loop.

- [ ] **5.1 Career & Goal Alignment**
  - [ ] Prioritize DSA tasks matching user's target role (e.g., Frontend $\rightarrow$ Trees/DOM, Backend $\rightarrow$ Graphs/DP).
  - [ ] Highlight stale DSA topics with no practice in >7 days.

- [ ] **5.2 Research Hub Stagnation Warnings**
  - [ ] Alert user when literature review for active thesis projects has stalled (>7 days without paper read).

---

## 🤖 Phase 6: Optional AI Layer (P3 — Future Expansion)

> **Goal:** Introduce optional natural language planning assistance on top of the deterministic foundation.

- [ ] **6.1 Natural Language Daily Planning Assist**
  - [ ] Optional AI prompt interface to parse text inputs into structured task schedules.
- [ ] **6.2 AI Weekly Review Summarizer**
  - [ ] Generate weekly productivity reflections using aggregated snapshot logs.

---

## 📈 Implementation Progress Checklist

| Phase | Description | Priority | Status |
| :--- | :--- | :---: | :---: |
| **Phase 0** | Architectural Foundations & Domain Types | **P0** | ⏳ Pending |
| **Phase 1** | Deterministic Today Task Scoring | **P0** | ⏳ Pending |
| **Phase 2** | Event Logging & Confidence Engine | **P1** | ⏳ Pending |
| **Phase 3** | Adaptive Today & Focus Mode | **P1** | ⏳ Pending |
| **Phase 4** | Transparency & User Control Panel | **P1** | ⏳ Pending |
| **Phase 5** | Cross-Module Intelligence | **P2** | ⏳ Pending |
| **Phase 6** | Optional AI Layer | **P3** | ⏳ Pending |
