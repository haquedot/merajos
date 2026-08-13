# Orbit Mobile --- Step-by-Step Mobile App Implementation Plan

**Backend Base URL**: `https://orbit.merajulhaque.com/api`  
**Architecture**: React Native CLI + TypeScript + MMKV (Offline Storage) + Zustand + Axios  

---

## Executive Overview

This document outlines the multi-phase engineering roadmap and actionable TODO checklists for building the **Orbit Mobile App**. The mobile application connects to the live production backend at `https://orbit.merajulhaque.com/api` and operates with an **Offline-First** model using MMKV for native instant data access and background sync queues.

---

## Phase 1: Project Setup, Design Tokens & Core Infrastructure

### 🎯 Objective
Initialize the React Native CLI project, configure native iOS/Android environments, set up the theme system, local MMKV storage, and Axios HTTP client.

### 📋 TODO List
- [ ] **1.1 Initialize React Native CLI App**
  - [ ] Run `npx @react-native-community/cli@latest init OrbitMobile --template react-native-template-typescript`.
  - [ ] Configure `tsconfig.json` with path aliases (`@/*` -> `./src/*`).
  - [ ] Configure iOS CocoaPods (`cd ios && pod install`).
  - [ ] Verify initial build on iOS Simulator and Android Emulator.

- [ ] **1.2 Install Core Dependencies**
  - [ ] Install Navigation: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`.
  - [ ] Install State & Storage: `zustand`, `react-native-mmkv`.
  - [ ] Install Networking: `axios`, `@tanstack/react-query`.
  - [ ] Install Icons & Animations: `lucide-react-native`, `react-native-svg`, `react-native-reanimated`, `react-native-gesture-handler`.

- [ ] **1.3 Build Design System & Theme Engine (`src/theme/`)**
  - [ ] Create `colors.ts` with Orbit brand palette (Navy `#1F3B99`, Accent `#3B82F6`, Dark mode `#0F172A`, Slate `#1E293B`).
  - [ ] Create `typography.ts` with font families, sizes, and weights.
  - [ ] Create `spacing.ts` and card style tokens (glassmorphism, subtle shadows, rounded-2xl).

- [ ] **1.4 Implement Local Storage Wrapper (`src/services/storage/`)**
  - [ ] Implement `storageService.ts` using `react-native-mmkv` with JSON serialization.
  - [ ] Implement helper methods (`getItem`, `setItem`, `removeItem`, `clearAll`).

- [ ] **1.5 Implement HTTP Client (`src/services/api/`)**
  - [ ] Create `apiClient.ts` with `baseURL: 'https://orbit.merajulhaque.com/api'`.
  - [ ] Add request/response interceptors for logging, authorization headers, and error formatting.
  - [ ] Define API endpoint constants in `endpoints.ts`.

---

## Phase 2: Native Authentication & Navigation Shell

### 🎯 Objective
Configure Google OAuth 2.0 with native credentials, sync user sessions with `POST https://orbit.merajulhaque.com/api/user`, and construct the main navigation hierarchy.

### 📋 TODO List
- [ ] **2.1 Configure Native Google OAuth 2.0**
  - [ ] Install `@react-native-google-signin/google-signin`.
  - [ ] Configure Google Cloud Console credentials for Android SHA-1 and iOS URL scheme.
  - [ ] Implement `googleAuthService.ts` to handle sign-in, token retrieval, and sign-out.

- [ ] **2.2 Implement User Auth State & API Integration (`src/features/auth/`)**
  - [ ] Create `authStore.ts` storing session state, profile info, and MMKV cache.
  - [ ] Connect sign-in flow to backend `POST /api/user` to register/sync profile in MongoDB.
  - [ ] Create `SignInScreen.tsx` with branding and Google Sign-In button.

- [ ] **2.3 Construct Navigation Hierarchy (`src/app/navigation/`)**
  - [ ] Define Navigation Param List types in `types.ts`.
  - [ ] Build `AuthNavigator.tsx` for unauthenticated screens.
  - [ ] Build `MainTabNavigator.tsx` with custom Tab Bar for Dashboard, Tasks, Research, Career, and Settings.
  - [ ] Build `AppNavigator.tsx` wrapping Auth & Main tabs based on `authStore` session status.

---

## Phase 3: Core Module Implementation (Tasks, Today & Calendar)

### 🎯 Objective
Develop the Tasks, Today, and Calendar modules with full CRUD capability, offline MMKV caching, and background sync with `GET/POST/PUT/DELETE https://orbit.merajulhaque.com/api/tasks` and `/api/events`.

### 📋 TODO List
- [ ] **3.1 Build Task Feature Store & Offline Sync (`src/features/tasks/`)**
  - [ ] Create `taskStore.ts` with actions: `loadTasks`, `addTask`, `updateTask`, `toggleTask`, `deleteTask`.
  - [ ] Implement local MMKV caching for instant UI response.
  - [ ] Implement background queue for offline mutations.

- [ ] **3.2 Implement Task Screens & UI Components**
  - [ ] Create `TaskCard.tsx` with priority badges, status toggles, category colors, and swipe-to-delete gestures.
  - [ ] Create `TaskListScreen.tsx` with filter tabs (`All`, `Today`, `Upcoming`, `Completed`, Category filters).
  - [ ] Create `TodayScreen.tsx` highlighting the **Top 3 Daily MITs (Most Important Tasks)**.
  - [ ] Create `AddTaskModal.tsx` for quick task creation with due dates, priority, and category pickers.

- [ ] **3.3 Implement Calendar Module & Event Sync (`src/features/calendar/`)**
  - [ ] Create `calendarStore.ts` for managing events.
  - [ ] Integrate backend `/api/events` endpoints.
  - [ ] Build `CalendarScreen.tsx` with agenda view and day/week/month schedule view.

---

## Phase 4: Research, Career & Client CRM Modules

### 🎯 Objective
Build the nested Multi-Project Research module, Career & DSA tracker, and Client CRM module connected to their respective backend API routes.

### 📋 TODO List
- [ ] **4.1 Implement Multi-Project Research Module (`src/features/research/`)**
  - [ ] Connect to `GET/POST/PUT/DELETE /api/research`.
  - [ ] Create `researchStore.ts` managing `projects[]` → `sections[]` → `papers[]`.
  - [ ] Build `ProjectListScreen.tsx` displaying research project cards, progress bars, and stats.
  - [ ] Build `ProjectDetailScreen.tsx` with tabbed navigation for Literature Review, Writing Progress, and Notes.
  - [ ] Build `PaperCard.tsx` with reading status dropdown, key paper star toggle, PDF link launcher, and citation export.
  - [ ] Implement **"Copy to Task"** feature to convert research papers into daily reading tasks in `taskStore`.

- [ ] **4.2 Implement Career & DSA Tracker (`src/features/career/`)**
  - [ ] Connect to `GET/POST/PUT/DELETE /api/career`.
  - [ ] Create `careerStore.ts` for job application funnel and DSA topic logs.
  - [ ] Build `JobApplicationScreen.tsx` with status Kanban/List (`Applied`, `Interviewing`, `Offered`, `Rejected`).
  - [ ] Build `DSATrackerScreen.tsx` with difficulty ratings (Easy, Medium, Hard) and mastery checkmarks.

- [ ] **4.3 Implement Client CRM Module (`src/features/clients/`)**
  - [ ] Connect to `GET/POST/PUT/DELETE /api/clients`.
  - [ ] Create `clientStore.ts` for client project and invoice tracking.
  - [ ] Build `ClientListScreen.tsx` and `ClientDetailScreen.tsx`.

---

## Phase 5: Habits, Goals, Notes & Instant Global Search

### 🎯 Objective
Implement Habits, Goals, Notes modules and construct the instant client-side Global Search (`Cmd+K` equivalent on mobile).

### 📋 TODO List
- [ ] **5.1 Implement Habits & Weekly Planner (`src/features/habits/`)**
  - [ ] Connect to `/api/habits`.
  - [ ] Build habit streak tracker and weekly completion grid screen.

- [ ] **5.2 Implement Goals & Notes Modules**
  - [ ] Connect to `/api/goals` and `/api/notes`.
  - [ ] Build `GoalListScreen.tsx` with milestone progress bars.
  - [ ] Build `NotesScreen.tsx` with rich markdown preview.

- [ ] **5.3 Implement Mobile Instant Global Search (`Cmd+K` equivalent)**
  - [ ] Build `GlobalSearchModal.tsx` accessible via header search icon.
  - [ ] Index all local stores (`tasks`, `research`, `career`, `notes`, `habits`) in parallel for <5ms search responses.

---

## Phase 6: Productivity Analytics, Polish & Native UX Optimizations

### 🎯 Objective
Integrate charts for analytics, polish visual design with glassmorphism cards, micro-animations, and haptic feedback.

### 📋 TODO List
- [ ] **6.1 Implement Productivity Analytics (`src/features/analytics/`)**
  - [ ] Integrate `@shopify/react-native-skia` or `react-native-svg-charts` for high-performance productivity graphs.
  - [ ] Display task completion rates, habit streak trends, and research thesis word count stats.

- [ ] **6.2 Polish UI/UX & Native Micro-Interactions**
  - [ ] Add native haptic feedback (`react-native-haptic-feedback`) when completing tasks or checking habits.
  - [ ] Implement fluid layout animations using `react-native-reanimated` for modal popups and card entries.
  - [ ] Add Skeleton loading states for smooth data fetches (`Skeleton.tsx`).

---

## Phase 7: Testing, CI/CD & App Deployment

### 🎯 Objective
Execute comprehensive test suites, configure automated Fastlane deployment pipelines, and publish to Apple App Store & Google Play Store.

### 📋 TODO List
- [ ] **7.1 Testing & Quality Assurance**
  - [ ] Write unit tests for Zustand stores and MMKV sync engine using Jest (`npm test`).
  - [ ] Test network transitions (online → offline → online) to ensure zero data loss.
  - [ ] Verify memory performance using React Native Performance Profiler.

- [ ] **7.2 CI/CD & Fastlane Setup**
  - [ ] Set up Fastlane for Android (`fastlane android beta`).
  - [ ] Set up Fastlane for iOS (`fastlane ios beta`).

- [ ] **7.3 Production Build & Store Publishing**
  - [ ] Generate Android Release Bundle (`.aab` via `./gradlew bundleRelease`).
  - [ ] Archive iOS Release via Xcode and upload to TestFlight / App Store Connect.
  - [ ] Prepare store screenshots, privacy policy links, and release notes.

---

## Backend API Reference Quick Summary

Base URL: `https://orbit.merajulhaque.com/api`

| Endpoint | Supported Methods | Description |
| :--- | :--- | :--- |
| `/api/user` | `GET`, `POST` | User session sync & MongoDB profile setup |
| `/api/tasks` | `GET`, `POST`, `PUT`, `DELETE` | Batch & single task CRUD operations |
| `/api/events` | `GET`, `POST`, `PUT`, `DELETE` | Calendar events sync & CRUD |
| `/api/research` | `GET`, `POST`, `PUT`, `DELETE` | Multi-project research, sections & papers CRUD |
| `/api/career` | `GET`, `POST`, `PUT`, `DELETE` | Job application funnel & DSA problem logs |
| `/api/clients` | `GET`, `POST`, `PUT`, `DELETE` | Client CRM projects, billing & invoices |
| `/api/habits` | `GET`, `POST`, `PUT`, `DELETE` | Habit streak tracking & daily completions |
| `/api/goals` | `GET`, `POST`, `PUT`, `DELETE` | Goals & milestone progress |
| `/api/notes` | `GET`, `POST`, `PUT`, `DELETE` | Markdown research & personal notes |
| `/api/access-request` | `POST` | Whitelist access request submission |
