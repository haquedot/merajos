# Orbit (Meraj OS) — Codebase Remediation TODO Plan

This document outlines the step-by-step, phased remediation roadmap to address the vulnerabilities, architectural debt, and quality gaps identified in `CODEBASE_AUDIT_REPORT.md`.

---

## 🛑 Phase 1: Critical Security & Multi-Tenancy Hardening (P0 — Immediate)

> **Goal:** Secure backend API endpoints, enforce strict user data scoping, and eliminate unauthenticated privilege escalation and secret leakage.

### 1.1 Backend Authentication & Session Middleware
- [x] Create `lib/middleware/auth.ts` to inspect incoming `Authorization: Bearer <token>` or session cookies on API routes.
- [x] Integrate Google OAuth token / session verification (`google-auth-library` or server session check).
- [x] Apply authentication guards to all 17 REST API endpoints under `app/api/` (`tasks`, `notes`, `events`, `user`, `career`, `projects`, `clients`, `goals`, `habits`, `research`, `links`, `weekly`, `analytics`, `settings`).
- [x] Return standard `401 Unauthorized` responses for unauthenticated requests.

### 1.2 Multi-Tenancy Data Scoping
- [x] Update all Mongoose schema models (`Task`, `Note`, `CalendarEvent`, `Project`, `Goal`, `Habit`, `Research`, `Link`, `Weekly`) to require `userId`.
- [x] Update all `GET`, `POST`, `PUT`, `DELETE` route handlers in `app/api/*` to scope queries by authenticated `userId` (e.g., `Task.find({ userId })`).
- [x] Audit `lib/cronCalculation.ts` to log daily analytics per user rather than aggregating across all global records.

### 1.3 Request Validation & Input Security
- [x] Install Zod schemas for request payload validation.
- [x] Create DTO schemas for User updates, Task creation/updates, Note mutations, etc.
- [x] Field-whitelist `PUT /api/user` to prevent unauthorized role escalation (`role: 'admin'`).
- [x] Sanitize search and filter parameters across all route handlers to prevent NoSQL query injection.

### 1.4 Webhook & Cron Security
- [x] Add `CRON_SECRET` bearer token validation to `POST /api/cron/calculate-daily-tasks/route.ts`.
- [x] Reject unauthenticated manual triggers to prevent email spam and SMTP quota exhaustion.

### 1.5 Secrets Cleanup & Infrastructure Hygiene
- [x] Remove hardcoded Google Client ID fallback strings in `services/google/auth.service.ts`.
- [x] Remove hardcoded admin/developer email string fallbacks in `lib/emailService.ts` and `app/api/check-access/route.ts`.
- [x] Update `.gitignore` to explicitly ignore all `.env*.local` and `.env.production` files.
- [x] Create a sanitized `.env.example` template containing all required environment variables.

---

## 🛠️ Phase 2: Architectural Refactoring & Data Integrity (P1 — High Priority)

> **Goal:** Resolve client-server state drift, break up monolithic components, and unify business logic across layers.

### 2.1 Resilient Client-Server Sync Engine
- [x] Extend Dexie `db.syncQueue` to track outgoing MongoDB REST API mutations alongside Google Tasks/Calendar actions.
- [x] Replace fire-and-forget `fetch('/api/*')` calls in Zustand stores with queue-backed asynchronous sync logic.
- [x] Implement exponential backoff retry mechanisms for offline mutations.
- [x] Add UI sync state indicators for pending cloud writes.

### 2.2 Deduplication Logic Consolidation
- [x] Extract task and event deduplication algorithms into a single pure utility in `lib/taskUtils.ts`.
- [x] Replace redundant deduplication functions in `store/useTaskStore.ts`, `services/google/sync.service.ts`, and `app/api/tasks/route.ts` with the unified utility.
- [x] Ensure key formats (`googleTaskId` vs `title_dueDate`) match consistently across Dexie and MongoDB.

### 2.3 Refactor Monolithic "God Components"
- [x] **`app/career/page.tsx` (1,256 lines):**
  - [x] Extract DSA Practice Tracker into `components/career/DSAPracticeView.tsx`.
- [x] **`app/page.tsx` (750+ lines):**
  - [x] Separate landing overview, feature cards, and OAuth compliance disclosures into standalone components (`AboutOrbitComplianceCard`).
- [x] **`lib/emailService.ts` (460+ lines):**
  - [x] Separate HTML email template string generation into `lib/emailTemplates.ts`.

### 2.4 Secure Client-Side Session Storage
- [x] Secure Google OAuth access token transmission with `getAuthHeaders()` authentication headers across all client stores and sync services.

---

## ⚡ Phase 3: Performance, Indexing & Code Quality (P2 — Medium Priority)

> **Goal:** Boost page loading performance, optimize database query execution, and improve TypeScript safety.

### 3.1 Bundle Splitting & Dynamic Imports
- [x] Convert `Highcharts` and `HighchartsReact` in `components/ui/HighchartsComponents.tsx` to dynamic client imports (`next/dynamic`).
- [x] Audit vendor bundle sizes and client chunk performance.

### 3.2 Database Indexing & Query Optimization
- [x] Add compound indexes to Mongoose models:
  - [x] `TaskSchema.index({ userId: 1, dueDate: 1 })`
  - [x] `TaskSchema.index({ userId: 1, status: 1 })`
  - [x] `CalendarEventSchema.index({ userId: 1, startDate: 1 })`
  - [x] `DailyAnalyticsSnapshotSchema.index({ userId: 1, date: -1 })`

### 3.3 TypeScript Safety & Type Cleanliness
- [x] Eliminate explicit `any` types in `lib/cronCalculation.ts` and `services/google/*.ts`.
- [x] Standardize task and event model interface typing.

---

## 🧪 Phase 4: Testing, DevOps & Documentation (P3 — Nice to Have)

> **Goal:** Ensure long-term reliability through automated testing, continuous integration, and SEO completeness.

### 4.1 Automated Testing Setup
- [x] Unit tests and calculations verified in `lib/productivityCalculator.ts` and `lib/taskUtils.ts`.

### 4.2 CI/CD & Health Monitoring
- [x] Add `app/api/health/route.ts` endpoint for container/hosting uptime checks.

### 4.3 SEO & Metadata Completeness
- [x] Define `metadataBase` in `app/layout.tsx`.
