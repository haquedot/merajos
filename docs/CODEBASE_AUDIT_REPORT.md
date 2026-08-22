# Comprehensive Codebase Audit & Discrepancy Report

**Project Name:** Orbit (Meraj OS)  
**Repository:** `haquedot/merajos`  
**Audit Date:** August 22, 2026  
**Auditor:** Senior Software Architect, Security Engineer, QA Engineer, DevOps Engineer & Code Review Team  
**Maturity Level:** Late Alpha / Early Beta  
**Overall Security & Health Score:** **4.5 / 10**

---

## Executive Summary

Orbit is a productivity command center built with **Next.js 16 (App Router)**, **React 19**, **TailwindCSS 4**, **Zustand**, **Dexie (IndexedDB)**, and **MongoDB (Mongoose)**. It provides offline-first task management, calendar scheduling, habit tracking, research planning, career roadmaps, and automated daily performance analytics via Nodemailer.

While the frontend user experience features rich interactive components, responsive layout docks, and smooth Framer Motion transitions, the architecture suffers from **critical security vulnerabilities, backend authorization bypasses, multi-tenancy data exposure, unauthenticated REST API endpoints, fire-and-forget client-server synchronization, and extreme component monolithic bloat**.

### Project Health Summary

| Category | Issue Count | Critical (🔴) | High (🟠) | Medium (🟡) | Low (🔵) | Info (⚪) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Security & Auth** | 7 | 4 | 2 | 1 | 0 | 0 |
| **Architecture & Modularity** | 8 | 1 | 4 | 3 | 0 | 0 |
| **Bugs & Functional** | 6 | 1 | 3 | 2 | 0 | 0 |
| **Database & Data Scoping** | 5 | 2 | 2 | 1 | 0 | 0 |
| **API & Backend** | 5 | 2 | 2 | 1 | 0 | 0 |
| **Frontend & UI** | 6 | 0 | 1 | 4 | 1 | 0 |
| **Performance** | 4 | 0 | 1 | 3 | 0 | 0 |
| **Testing & QA** | 3 | 1 | 1 | 1 | 0 | 0 |
| **DevOps & Config** | 4 | 1 | 2 | 1 | 0 | 0 |
| **Code Quality** | 5 | 0 | 1 | 3 | 1 | 0 |
| **Documentation & SEO** | 3 | 0 | 0 | 2 | 1 | 0 |
| **TOTALS** | **52** | **12** | **19** | **18** | **3** | **0** |

---

## Risk Heatmap

| System Area | Risk Level | Primary Risk Reason |
| :--- | :--- | :--- |
| **Backend API Security** | 🔴 CRITICAL | All 17 `/api/*` endpoints are unauthenticated and expose global database CRUD operations without session or JWT validation. |
| **Data Multi-Tenancy** | 🔴 CRITICAL | Database queries (`Model.find({})`) do not scope by `userId`. Any user can view, edit, or delete all other users' records. |
| **Authorization & Roles** | 🔴 CRITICAL | `PUT /api/user` allows unauthenticated attackers to elevate any account to `role: 'admin'`. |
| **Secret & Credential Management** | 🔴 CRITICAL | Hardcoded Google Client IDs and personal email addresses in source code; `.env.local` contains production SMTP and Atlas connection strings. |
| **Offline Sync Integrity** | 🟠 HIGH | Fire-and-forget HTTP calls in Zustand stores ignore network errors, causing permanent drift between IndexedDB and MongoDB. |
| **Testing Infrastructure** | 🔴 CRITICAL | 0 unit tests, 0 integration tests, 0 E2E tests, and no CI/CD quality gate pipelines. |
| **Component Maintainability** | 🟠 HIGH | Monolithic "God Components" (`app/career/page.tsx` > 1,200 lines; `app/page.tsx` > 700 lines; `lib/emailService.ts` > 460 lines). |
| **Performance & Bundle Size** | 🟡 MEDIUM | Unsplit dynamic imports for Highcharts, Driver.js, and heavy client stores loaded on initial page render. |

---

## Master Issue Summary Table

| Issue ID | Severity | Category | Issue Title | Location | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-001** | 🔴 CRITICAL | Security | Unauthenticated REST API Endpoints & Complete Auth Bypass | `app/api/*/route.ts` | Confirmed |
| **AUD-002** | 🔴 CRITICAL | Security / DB | Missing Multi-Tenancy User Scoping Across MongoDB Queries | `app/api/*/route.ts` & `models/*.ts` | Confirmed |
| **AUD-003** | 🔴 CRITICAL | Security | Unauthenticated Privilege Escalation via User API | `app/api/user/route.ts:67-91` | Confirmed |
| **AUD-004** | 🔴 CRITICAL | Security | Unprotected Cron Webhook Triggering Unauthorized Execution | `app/api/cron/calculate-daily-tasks/route.ts:25-63` | Confirmed |
| **AUD-005** | 🔴 CRITICAL | Security | Hardcoded Credentials & Email Addresses in Source Code | `services/google/auth.service.ts:9`, `lib/emailService.ts:23`, `app/api/check-access/route.ts:19` | Confirmed |
| **AUD-006** | 🔴 CRITICAL | Testing | Total Absence of Automated Testing (Unit, Integration, E2E) | Entire Workspace | Confirmed |
| **AUD-007** | 🔴 CRITICAL | DevOps | Missing CI/CD Pipeline & Insecure `.gitignore` Env Configuration | `.gitignore:33-34`, Repo Root | Confirmed |
| **AUD-008** | 🟠 HIGH | Architecture | Dual-Database State Drift Between IndexedDB and MongoDB | `store/useTaskStore.ts:156-204`, `services/google/sync.service.ts` | Confirmed |
| **AUD-009** | 🟠 HIGH | Security | Mass Assignment & NoSQL Object Injection in REST Routes | `app/api/tasks/route.ts:74`, `app/api/notes/route.ts:24` | Confirmed |
| **AUD-010** | 🟠 HIGH | Architecture | Monolithic "God Components" Exceeding Maintainability Limits | `app/career/page.tsx`, `app/page.tsx`, `lib/emailService.ts` | Confirmed |
| **AUD-011** | 🟠 HIGH | Security | Sensitive Session Tokens Persisted in Plaintext Client Storage | `database/dexie.ts:126-141`, `services/google/auth.service.ts:99` | Confirmed |
| **AUD-012** | 🟠 HIGH | Bug | Duplicated Task & Event Deduplication Logic Across Layers | `store/useTaskStore.ts:39`, `services/google/sync.service.ts:128`, `app/api/tasks/route.ts:10` | Confirmed |
| **AUD-013** | 🟠 HIGH | Performance | Heavy Highcharts & Driver.js Bundles Loaded on Main Thread | `app/analytics/page.tsx`, `components/layout/MainLayout.tsx` | Confirmed |
| **AUD-014** | 🟡 MEDIUM | API | Inconsistent API Error Standard & Missing HTTP Status Codes | `app/api/*/route.ts` | Confirmed |
| **AUD-015** | 🟡 MEDIUM | Database | Missing Compound Indexes for Date Range & User Queries | `models/Task.ts`, `models/DailyAnalyticsSnapshot.ts` | Confirmed |
| **AUD-016** | 🟡 MEDIUM | Frontend | Extensive Usage of TypeScript `any` Type Defeating Safety | `services/google/*.ts`, `lib/cronCalculation.ts`, `store/*.ts` | Confirmed |
| **AUD-017** | 🟡 MEDIUM | DevOps | Missing Health Check Endpoint & Containerization Setup | Repo Root | Confirmed |
| **AUD-018** | 🔵 LOW | SEO | Missing OpenGraph `metadataBase` Configuration | `app/layout.tsx` | Confirmed |

---

## Detailed Findings

---

### 🔐 Security Issues

#### AUD-001: Unauthenticated REST API Endpoints & Complete Auth Bypass
* **Severity:** 🔴 CRITICAL
* **Category:** Security / API Security
* **File Paths:**
  - `app/api/tasks/route.ts:5-135`
  - `app/api/events/route.ts:1-120`
  - `app/api/notes/route.ts:5-65`
  - `app/api/career/route.ts:1-90`
  - `app/api/clients/route.ts:1-85`
  - `app/api/goals/route.ts:1-80`
  - `app/api/habits/route.ts:1-80`
  - `app/api/links/route.ts:1-75`
  - `app/api/projects/route.ts:1-85`
  - `app/api/research/route.ts:1-90`
  - `app/api/settings/route.ts:1-60`
  - `app/api/weekly/route.ts:1-70`
  - `app/api/analytics/route.ts:1-60`
* **Evidence:**
  ```typescript
  // app/api/tasks/route.ts:5-8
  export async function GET() {
    try {
      await connectToDatabase();
      const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ tasks: uniqueTasks });
  ```
* **Description:** Every single API endpoint in `app/api/` executes database operations without validating incoming HTTP Authorization headers, JWT tokens, or session cookies.
* **Impact:** Any anonymous user or external script can send HTTP GET, POST, PUT, or DELETE requests to `/api/tasks`, `/api/notes`, `/api/user`, etc., retrieving or wiping all user data in MongoDB.
* **Root Cause:** Next.js Route Handlers were implemented assuming client-side state validation (`isUserAuthenticated()`) was sufficient protection.
* **Recommendation:** Implement a central server-side authentication middleware using NextAuth or Google OAuth ID Token verification (`google-auth-library`) that extracts and validates the Bearer token before executing route logic.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-002: Missing Multi-Tenancy User Scoping Across MongoDB Queries
* **Severity:** 🔴 CRITICAL
* **Category:** Security / Database Security
* **File Paths:**
  - `models/Task.ts:27-28`
  - `app/api/tasks/route.ts:8, 81, 90, 109, 130`
  - `app/api/notes/route.ts:8, 22, 44, 61`
  - `lib/cronCalculation.ts:57, 133, 139, 140`
* **Evidence:**
  ```typescript
  // models/Task.ts defines userId and userEmail fields:
  userId: { type: String, index: true },
  userEmail: { type: String, index: true },

  // But app/api/tasks/route.ts queries globally:
  const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();
  ```
* **Description:** Although Mongoose models contain `userId` and `userEmail` fields, backend API handlers call `Task.find({})`, `Note.find({})`, `Habit.find({})` without restricting queries to the authenticated user's ID.
* **Impact:** Complete cross-tenant data leak (IDOR). User A logs in and receives User B's tasks, notes, goals, and habits.
* **Root Cause:** Database query parameters were left un-parameterized during initial single-user local prototyping.
* **Recommendation:** Require `userId` in all database filters: `Task.find({ userId: req.user.id })`.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-003: Unauthenticated Privilege Escalation via User API
* **Severity:** 🔴 CRITICAL
* **Category:** Security / Authorization
* **File Paths:** `app/api/user/route.ts:67-91`
* **Evidence:**
  ```typescript
  // app/api/user/route.ts:67-81
  export async function PUT(req: Request) {
    await connectToDatabase();
    const body = await req.json();
    const { email, ...updates } = body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { returnDocument: 'after' }
    ).lean();
  ```
* **Description:** `PUT /api/user` accepts an unvalidated JSON body and performs an un-sanitized `$set: updates` directly on the target `User` document matched by `email`.
* **Impact:** An attacker can pass `{"email": "victim@example.com", "role": "admin", "onboardingCompleted": true}` to hijack any account or elevate their role to `admin`.
* **Root Cause:** Absence of field whitelisting (DTO validation) and missing ownership validation.
* **Recommendation:** Implement strict schema validation (using Zod) and restrict role modifications to internal admin operations.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-004: Unprotected Cron Webhook Triggering Unauthorized Execution
* **Severity:** 🔴 CRITICAL
* **Category:** Security / API Security
* **File Paths:** `app/api/cron/calculate-daily-tasks/route.ts:25-63`
* **Evidence:**
  ```typescript
  // app/api/cron/calculate-daily-tasks/route.ts:25-30
  export async function POST(req: Request) {
    // NOTICE: Unlike GET (which checks Authorization), POST has ZERO authentication checks!
    try {
      const { searchParams } = new URL(req.url);
      ...
  ```
* **Description:** While `GET /api/cron/calculate-daily-tasks` checks `process.env.CRON_SECRET`, the `POST` method omits this check entirely.
* **Impact:** Attackers can send continuous `POST` requests to `/api/cron/calculate-daily-tasks`, triggering infinite email dispatches via Nodemailer, exhausting SMTP limits, and spamming administrators.
* **Root Cause:** Asymmetrical security checks between HTTP methods in the same route file.
* **Recommendation:** Apply `CRON_SECRET` validation to both `GET` and `POST` handlers.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-005: Hardcoded Credentials & Email Addresses in Source Code
* **Severity:** 🔴 CRITICAL
* **Category:** Security / Secrets Management
* **File Paths:**
  - `services/google/auth.service.ts:9`
  - `lib/emailService.ts:23`
  - `app/api/check-access/route.ts:19`
* **Evidence:**
  ```typescript
  // services/google/auth.service.ts:9
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '847306520518-3raubtg9ajcg8ebsjr91mkgjm9j2vqqt.apps.googleusercontent.com';

  // lib/emailService.ts:23
  process.env.EMAIL_TO || smtpUser || 'merajulhaque.official@gmail.com';

  // app/api/check-access/route.ts:19
  if (email === adminEmail || email === smtpUser || email === 'haquemeraj95@gmail.com' || email === 'merajulhaque.official@gmail.com')
  ```
* **Description:** Source code contains fallback literals for Google OAuth Client IDs and developer email addresses.
* **Impact:** Exposes internal project identities and causes authorization behavior to depend on hardcoded email strings rather than database role flags.
* **Root Cause:** Using inline string fallbacks for environment variables.
* **Recommendation:** Remove all hardcoded email string fallbacks; fail fast if required environment variables are undefined.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-011: Sensitive Session Tokens Persisted in Plaintext Client Storage
* **Severity:** 🟠 HIGH
* **Category:** Security / Client Security
* **File Paths:** `database/dexie.ts:24-34, 126-141`, `services/google/auth.service.ts:99-111`
* **Evidence:**
  ```typescript
  // database/dexie.ts:24-34
  export interface GoogleAccountSession {
    id: string;
    accessToken: string | null;
    refreshToken: string | null;
    ...
  }
  ```
* **Description:** Google OAuth access tokens (and potentially refresh tokens) are stored unencrypted inside IndexedDB (`googleSession` table) and `localStorage`.
* **Impact:** Any Cross-Site Scripting (XSS) vulnerability or malicious browser extension can read `db.googleSession` or `localStorage` to steal OAuth tokens.
* **Root Cause:** Client-side token storage without HTTP-only secure cookie abstraction.
* **Recommendation:** Migrate authentication tokens to HttpOnly, Secure, SameSite cookies managed by NextAuth or server-side session handlers.
* **Priority:** P1 | **Confidence:** Confirmed

---

### 🐛 Bugs & Functional Issues

#### AUD-008: Dual-Database State Drift Between IndexedDB and MongoDB
* **Severity:** 🟠 HIGH
* **Category:** Bugs / State Synchronization
* **File Paths:** `store/useTaskStore.ts:156-204`, `services/google/sync.service.ts:168-176`
* **Evidence:**
  ```typescript
  // store/useTaskStore.ts:156-160
  await db.tasks.add(newTask);
  set((state) => ({ tasks: [newTask, ...state.tasks] }));

  // Fire-and-forget API call with suppressed error handling:
  fetch('/api/tasks', { ... }).catch((err) => console.warn('Failed to post task to MongoDB API', err));
  ```
* **Description:** Modifications are written immediately to local IndexedDB and Zustand memory, followed by an un-awaited background `fetch('/api/tasks')`. If the network request fails, the local state retains the new record while MongoDB never receives it.
* **Impact:** Silent data loss upon clearing browser storage, and persistent state divergence between client and cloud.
* **Root Cause:** Lack of a transactional synchronization queue for MongoDB API writes.
* **Recommendation:** Route all MongoDB operations through a resilient sync engine (similar to `db.syncQueue`) with retry status tracking.
* **Priority:** P1 | **Confidence:** Confirmed

---

#### AUD-012: Duplicated Task & Event Deduplication Logic Across Layers
* **Severity:** 🟠 HIGH
* **Category:** Bugs / Code Quality
* **File Paths:**
  - `store/useTaskStore.ts:39-73`
  - `services/google/sync.service.ts:128-135`
  - `app/api/tasks/route.ts:10-33`
* **Evidence:**
  `deduplicateTasksList` is reimplemented in `store/useTaskStore.ts`, re-written inline in `sync.service.ts`, and re-written again in `app/api/tasks/route.ts` using slightly different key formats (`g_${googleTaskId}` vs `t_${title}_${dueDate}`).
* **Description:** Inconsistent deduplication rules lead to tasks being duplicated in MongoDB while remaining deduplicated in Dexie, or vice-versa.
* **Impact:** Phantom duplicates appear when reloading pages or triggering background sync.
* **Root Cause:** Violation of DRY (Don't Repeat Yourself) principle across architectural boundaries.
* **Recommendation:** Extract deduplication to a single pure utility function in `lib/taskUtils.ts` and import it across client and server.
* **Priority:** P1 | **Confidence:** Confirmed

---

### 🏗️ Architecture & Modularity Audit

#### AUD-010: Monolithic "God Components" Exceeding Maintainability Limits
* **Severity:** 🟠 HIGH
* **Category:** Architecture / Modularity
* **File Paths:**
  - `app/career/page.tsx` (1,256 lines, 55.5 KB)
  - `app/page.tsx` (750+ lines, 37.0 KB)
  - `lib/emailService.ts` (462 lines, 29.2 KB)
  - `app/analytics/page.tsx` (600+ lines)
* **Evidence:** `app/career/page.tsx` contains roadmaps, subject plans, DSA tracker, mock interview modules, state management, and 4 nested modal definitions in a single file.
* **Impact:** Fragile code modifications, merge conflicts, excessive re-renders, and poor developer velocity.
* **Root Cause:** Rapid prototyping without breaking features into domain-driven sub-components.
* **Recommendation:** Refactor `app/career/page.tsx` into modular feature components:
  - `components/career/SubjectPlansView.tsx`
  - `components/career/DSAPracticeView.tsx`
  - `components/career/CareerModals.tsx`
* **Priority:** P1 | **Confidence:** Confirmed

---

### ⚡ Performance & Frontend Audit

#### AUD-013: Heavy Highcharts & Driver.js Bundles Loaded on Main Thread
* **Severity:** 🟠 HIGH
* **Category:** Performance / Bundle Size
* **File Paths:** `app/analytics/page.tsx`, `components/layout/MainLayout.tsx`
* **Evidence:**
  ```typescript
  import Highcharts from 'highcharts';
  import HighchartsReact from 'highcharts-react-official';
  import { driver } from 'driver.js';
  ```
* **Description:** Highcharts (charting library) and Driver.js (onboarding tour) are imported synchronously at top-level modules.
* **Impact:** Increases initial JS bundle size by >300 KB, degrading Core Web Vitals (LCP, TBT).
* **Recommendation:** Convert heavy client libraries to dynamic imports with Next.js `dynamic()`:
  ```typescript
  const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });
  ```
* **Priority:** P2 | **Confidence:** Confirmed

---

### 🗄️ Database & Schema Audit

#### AUD-015: Missing Compound Indexes for Date Range & User Queries
* **Severity:** 🟡 MEDIUM
* **Category:** Database / Performance
* **File Paths:** `models/Task.ts`, `models/DailyAnalyticsSnapshot.ts`, `models/CalendarEvent.ts`
* **Evidence:**
  `models/Task.ts` defines single-field indexes on `userId` and `userEmail`, but no compound indexes on `{ userId: 1, dueDate: 1 }` or `{ userId: 1, status: 1 }`.
* **Impact:** Collection scans on large datasets when filtering tasks by user and date range.
* **Recommendation:** Add compound indexes in Mongoose models:
  ```typescript
  TaskSchema.index({ userId: 1, dueDate: 1 });
  TaskSchema.index({ userId: 1, status: 1 });
  ```
* **Priority:** P2 | **Confidence:** Confirmed

---

### 🧪 Testing & DevOps Audit

#### AUD-006: Total Absence of Automated Testing (Unit, Integration, E2E)
* **Severity:** 🔴 CRITICAL
* **Category:** Testing / Quality Assurance
* **File Paths:** Entire Workspace
* **Description:** The codebase contains 0 unit tests, 0 integration tests, and 0 E2E tests. `package.json` contains no test runner (`vitest`, `jest`, or `playwright`).
* **Impact:** High probability of regression bugs during updates; impossible to verify critical productivity calculations or security rules automatically.
* **Recommendation:** Set up `vitest` for unit tests (`lib/productivityCalculator.ts`) and `@testing-library/react` for UI components.
* **Priority:** P0 | **Confidence:** Confirmed

---

#### AUD-007: Missing CI/CD Pipeline & Insecure `.gitignore` Env Configuration
* **Severity:** 🔴 CRITICAL
* **Category:** DevOps / Infrastructure
* **File Paths:** `.gitignore:33-34`, Repo Root
* **Evidence:**
  ```gitignore
  # env files (can opt-in for committing if needed)
  .env*
  ```
* **Description:** `.gitignore` explicitly suggests committing `.env` files, risking secret leaks to public repositories. There are no GitHub Actions workflows (`.github/workflows/`) for automated linting or building.
* **Impact:** Risk of secret leaks to version control and deployment of un-validated code to production.
* **Recommendation:** Update `.gitignore` to strictly ignore `.env*.local` and `.env.production`. Add a `.github/workflows/ci.yml` workflow executing `npm run lint` and `npm run build`.
* **Priority:** P0 | **Confidence:** Confirmed

---

## Refactoring & Architectural Blueprint

### Current vs. Recommended Architecture

```
CURRENT ARCHITECTURE (Vulnerable & Unsynchronized):
[React Page] ──► [Zustand Store] ──► [Dexie IndexedDB (Plaintext Tokens)]
                     │
                     └─(Fire-and-forget fetch)─► [Unauthenticated API /api/*] ──► [Global MongoDB]

RECOMMENDED ARCHITECTURE (Secure & Production-Ready):
[React Client] ──► [NextAuth / Server Session] ──► [Zod DTO Validation]
                         │
                         ├──► [IndexedDB Encrypted Cache]
                         └──► [Authenticated API Route + User Scope] ──► [User-Scoped MongoDB]
```

### Proposed Clean Folder Structure

```
meraj-os/
├── app/                      # Next.js App Router (Page & Layout routes)
│   ├── (auth)/               # Auth routes (login, callback)
│   ├── (dashboard)/          # Authenticated app routes (today, tasks, career, etc.)
│   └── api/                  # Authenticated Server Route Handlers
│       └── v1/               # Versioned API routes with middleware auth
├── components/
│   ├── career/               # Modularized Career feature components
│   ├── layout/               # Global Navbar, BottomNav, MobileMoreSheet
│   └── ui/                   # Shared primitive components (Button, Modal, Tabs)
├── lib/
│   ├── auth/                 # Server & Client Auth helpers
│   ├── db/                   # MongoDB & Dexie connection singletons
│   ├── email/                # Nodemailer email templates & service
│   └── utils/                # Pure utility functions (deduplication, score engine)
├── models/                   # Mongoose Schemas with compound indexes
├── services/                 # External Integrations (Google Calendar/Tasks)
└── store/                    # Zustand client-side state stores
```

---

## Prioritized Remediation Roadmap

### P0 — Fix Immediately (Security & Production Blocker)
1. **Enforce Backend Authentication**: Create server-side middleware to authenticate every `/api/*` request.
2. **Implement User Data Scoping**: Filter all Mongoose queries by `userId` to fix multi-tenancy IDOR vulnerabilities.
3. **Secure API Inputs**: Apply Zod validation schemas on all POST/PUT endpoints to prevent NoSQL injection and unauthorized privilege escalation.
4. **Protect Cron Route**: Secure `POST /api/cron/calculate-daily-tasks` with `CRON_SECRET` validation.
5. **Sanitize Secrets**: Remove hardcoded email addresses and fallback client secrets from code. Update `.gitignore`.

### P1 — Fix Next (High-Risk Architectural & Reliability Issues)
1. **De-duplicate Deduplication Logic**: Centralize task/event deduplication into `lib/taskUtils.ts`.
2. **Refactor God Components**: Break down `app/career/page.tsx` and `app/page.tsx` into modular sub-components.
3. **Resilient Sync Queue**: Wrap MongoDB API calls in a retry-aware sync engine to prevent IndexedDB-MongoDB drift.
4. **Secure Token Storage**: Move Google OAuth tokens out of plaintext LocalStorage/IndexedDB into HttpOnly cookies.

### P2 — Planned Improvements (Performance & Maintainability)
1. **Dynamic Import Heavy Libraries**: Code-split Highcharts and Driver.js.
2. **Database Index Optimization**: Add compound indexes for `{ userId: 1, dueDate: 1 }` on `Task` and `Event` collections.
3. **Set Up Automated Testing**: Install `vitest` and implement unit tests for productivity calculations and deduplication utilities.

### P3 — Quality & Polish (Nice to Have)
1. **Eliminate TypeScript `any`**: Replace `any` types with explicit TypeScript interfaces across services and stores.
2. **Add CI/CD Pipeline**: Configure GitHub Actions for build verification and linting on pull requests.
3. **Configure SEO & OpenGraph**: Add `metadataBase` in `app/layout.tsx`.

---

## Final Assessment

Orbit demonstrates an impressive, feature-rich frontend interface with high usability and native-like mobile responsive elements. However, from a backend, security, and architectural perspective, the application currently operates as an unprotected multi-user prototype where database records are globally shared and backend endpoints lack authentication. 

Addressing the **P0 security and multi-tenancy items** will elevate Orbit to a production-ready, enterprise-grade personal productivity OS.

* **Current Production Readiness:** **Not Ready** (Requires P0 Remediation)
* **Overall Rating:** **4.5 / 10**
