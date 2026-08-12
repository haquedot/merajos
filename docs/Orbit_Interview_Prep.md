# Orbit (Meraj OS) --- Complete Technical Interview Guide

This document contains comprehensive interview questions, detailed answers, architectural deep-dives, and STAR-method behavioral responses for **Orbit**, your full-stack offline-first productivity operating system built with **Next.js 16**, **React 19**, **TypeScript**, **MongoDB**, **Dexie.js (IndexedDB)**, **Zustand**, and **Google OAuth 2.0 / APIs**.

---

## Table of Contents
1. [Elevator Pitches & System Overview](#1-elevator-pitches--system-overview)
2. [Frontend Architecture & Next.js 16 / React 19](#2-frontend-architecture--nextjs-16--react-19)
3. [Offline-First Architecture & Dual Database (IndexedDB + MongoDB)](#3-offline-first-architecture--dual-database)
4. [Third-Party API Integration (Google OAuth 2.0, Calendar & Tasks)](#4-third-party-api-integration)
5. [System Design, Scalability & Performance](#5-system-design-scalability--performance)
6. [Behavioral & Technical Trade-Offs (STAR Method)](#6-behavioral--technical-trade-offs-star-method)

---

## 1. Elevator Pitches & System Overview

### Q1: "Tell me about your project, Orbit."
**Answer (2-Minute Pitch):**
> "Orbit is an offline-first productivity operating system engineered to unify daily task management, research paper workflows, career development (DSA & job tracking), and client management into a single, high-performance web application.
> 
> As developers and researchers, we constantly context-switch between disparate tools like Google Calendar, Notion, paper readers, and job trackers. I built Orbit using Next.js 16, React 19, and TypeScript to solve this fragmentation. 
> 
> Key technical highlights include:
> 1. **Offline-First Architecture**: Built using IndexedDB via Dexie.js for zero-latency local data access, paired with background mutation queues that sync with MongoDB and Google APIs when back online.
> 2. **Nested Multi-Project Research Module**: Enables researchers to organize papers into custom sections, automatically format citations, track reading progress, and turn paper takeaways directly into actionable tasks.
> 3. **Two-Way Google Sync**: Integrates Google Calendar and Tasks via Google OAuth 2.0 with silent background token refreshing (`prompt: 'none'`).
> 4. **Instant Global Search (`Cmd+K`)**: Provides client-side indexed search across all tasks, research papers, habits, and career logs in under 10 milliseconds."

---

## 2. Frontend Architecture & Next.js 16 / React 19

### Q2: Why did you choose Next.js 16 (App Router) and React 19?
**Answer:**
- **App Router & Server Components**: Allowed separation between static shell layouts/API endpoints and dynamic interactive client components. Next.js App Router provides built-in route handlers (`app/api/`) for MongoDB sync.
- **React 19 Support**: Utilized modern React 19 hooks and optimistic rendering patterns for snappy UI interactions.
- **TypeScript Strictness**: Ensured full end-to-end type safety across Dexie DB schemas, Zustand stores, MongoDB Mongoose models, and component props.

### Q3: How do you handle state management across multiple modules in Orbit?
**Answer:**
- We use a dual-tier state architecture:
  1. **Zustand (In-Memory Reactive State)**: Modules (`useTaskStore`, `useResearchStore`, `useCalendarStore`, etc.) expose fast, reactive Zustand state for UI components.
  2. **Dexie.js (Persistent Client Storage)**: On initial application boot or module mount, stores load their state directly from IndexedDB via `loadFromDB()`. When a user mutates state (e.g., completes a task or updates paper status), the change is immediately written to both Zustand and IndexedDB, triggering background sync queues for MongoDB.

### Q4: How does the Global Modal Search (`Cmd+K`) work efficiently with zero search latency?
**Answer:**
- Rather than making server API requests on every keystroke, the `GlobalSearchModal` queries the local Zustand stores and Dexie IndexedDB indices in parallel across tasks, research projects, habits, DSA topics, and notes.
- Queries are memoized using React `useMemo` and client-side string fuzzy matching, returning results in under 5ms without network overhead.

---

## 3. Offline-First Architecture & Dual Database

### Q5: Why did you choose an Offline-First approach with IndexedDB (Dexie.js) + MongoDB?
**Answer:**
- **User Experience**: Productivity tools must load instantly regardless of network speed. Storing data locally in IndexedDB allows Orbit to launch in <100ms with zero loading spinners for cached data.
- **Offline Reliability**: Users can create tasks, mark papers as read, or log job applications on a plane or spotty connection.
- **Cloud Backup**: MongoDB serves as the centralized cloud source of truth, persisting user data across different browsers and devices.

### Q6: How does the offline background mutation queue work?
**Answer:**
```
[User Action] ──► [Write to Dexie DB] ──► [Add Mutation to Dexie `syncQueue`]
                                                     │
                                             (Is Online?)
                                           ┌─────────┴─────────┐
                                          YES                 NO
                                           │                   │
                                 [Process Queue API]   [Wait for 'online' event]
```
1. When offline, actions (create task, update event, delete paper) write locally and append an item to Dexie's `syncQueue` table containing `action`, `entityType`, `entityId`, and `payload`.
2. When the browser triggers the `online` event, `syncService.processOfflineQueue()` reads pending mutations, calls the respective API endpoints (MongoDB or Google REST API), and clears successfully pushed items from the queue.

### Q7: How do you resolve conflicts if data is modified locally and on the server?
**Answer:**
- We implement a **Last-Write-Wins (LWW)** strategy using ISO timestamp checks (`lastSyncedAt` / `updatedAt`).
- When syncing remote Google Tasks or MongoDB documents, if `local.syncStatus === 'pending'`, the local pending mutation takes priority. Otherwise, the incoming server payload updates Dexie DB to ensure remote consistency.

---

## 4. Third-Party API Integration

### Q8: How did you implement Google OAuth 2.0 and why was the Google Sign-In modal opening automatically earlier?
**Answer:**
- **OAuth Integration**: Used Google Identity Services (GIS) `window.google.accounts.oauth2.initTokenClient` to request OAuth 2.0 access tokens for Google Calendar (`/auth/calendar`) and Google Tasks (`/auth/tasks`).
- **The Issue**: Google access tokens expire every 60 minutes. Our background sync service ran every 2 minutes. When `refreshAccessTokenSilently()` called `requestAccessToken({ prompt: '' })`, GIS interpreted `prompt: ''` as permission to open an interactive Google OAuth popup over the user's screen.
- **The Fix**: Updated `refreshAccessTokenSilently()` to strictly pass `prompt: 'none'`. This suppresses any interactive popups. If silent refresh fails (e.g. user session ended), it fails quietly in the background, ensuring login popups only open when triggered by an explicit user button click.

---

## 5. System Design, Scalability & Performance

### Q9: How would you scale Orbit to support 100,000 active users?
**Answer:**
1. **Stateless Next.js API Routes**: Deploy Next.js on Vercel or AWS Lambda with auto-scaling serverless containers.
2. **MongoDB Connection Pooling & Indexing**: Use Mongoose connection caching in serverless environments (`global.mongoose`), index frequent query fields (`userId`, `dueDate`, `projectId`), and implement MongoDB Atlas Sharding.
3. **Delta Sync Protocol**: Replace full database fetches with incremental delta syncs using `updatedSince` timestamps or MongoDB Change Streams / WebSockets.
4. **Client-Side Storage Caching**: Increase Dexie IndexedDB cache bounds and paginate search query indexing.

---

## 6. Behavioral & Technical Trade-Offs (STAR Method)

### Q10: "Describe a major technical challenge you faced while building Orbit and how you solved it." (STAR Method)

- **Situation**: While building the multi-project Research module, users needed to organize literature reviews into dynamic user-created sections (e.g., Literature Review, Datasets, Algorithms) with nested paper cards, reading progress, and citation exports, while also supporting task creation.
- **Task**: The legacy flat `Paper` Dexie table could not support multi-project nested sections or cross-module task syncing without severe schema fragmentation.
- **Action**:
  1. Rewrote the MongoDB schema (`Research.ts`) and TypeScript definitions to use a hierarchical structure: `ResearchProject` → `sections[]` → `papers[]`.
  2. Built `useResearchStore` to handle deep immutable state updates.
  3. Integrated cross-module sync logic so clicking "Copy to Task" on any research paper automatically generates a high-priority "Read Paper" task in `useTaskStore` and Dexie `tasks` table.
  4. Purged legacy tables cleanly while ensuring zero TypeScript errors (`npx tsc --noEmit`).
- **Result**: Delivered a smooth multi-project research platform where researchers can organize papers, track writing progress, export citations, and seamlessly turn papers into actionable daily tasks.

---

## Quick Cheat-Sheet Summary

| Topic | Key Keyword / Concept |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **State Management** | Zustand (In-Memory) + Dexie.js (IndexedDB persistent cache) |
| **Offline Sync** | `syncQueue` table + Last-Write-Wins conflict handling + `online` event listener |
| **Google Auth** | GIS OAuth 2.0, silent background refresh with `prompt: 'none'` |
| **Search** | Client-side zero-latency `Cmd+K` global search across indexed stores |
| **UI Aesthetics** | Dark mode, Glassmorphism, Tailwind CSS, Framer Motion springs, Highcharts |
