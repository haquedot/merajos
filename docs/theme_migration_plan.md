# 🪐 Orbit Design System Theme Migration Plan

> **Brand Palette Basis**: Calibrated directly from `orbit-dark.png` & `orbit-light.png`
> - **Primary Accent**: Orbit Electric Royal Blue (`#0066FF` / `bg-orbit-blue` / `text-orbit-blue`)
> - **Secondary Accent**: Orbit Glowing Orange (`#FF6B00` / `bg-orbit-orange` / `text-orbit-orange`)
> - **Dark Background**: Orbit Deep Space Navy (`#0A0F1D` / `bg-orbit-bg-dark`)
> - **Dark Cards & Borders**: `#131B2E` (`bg-orbit-card-dark`) & `#1E2A42` (`border-orbit-border-dark`)

---

## 🎨 Design System Utility Standards

Use standard Tailwind CSS `@theme` utility classes across all components and pages instead of inline hex values:

| Token Name | Class | Hex / Value | Usage |
| :--- | :--- | :--- | :--- |
| **Orbit Blue** | `bg-orbit-blue`, `text-orbit-blue`, `border-orbit-blue` | `#0066FF` | Primary actions, main brand accents, focus rings |
| **Orbit Blue Hover** | `hover:bg-orbit-blue-hover` | `#0052CC` | Interactive hover state for primary buttons |
| **Orbit Orange** | `bg-orbit-orange`, `text-orbit-orange`, `border-orbit-orange` | `#FF6B00` | Satellite dot accents, urgent priorities, live indicators |
| **Orbit Orange Hover**| `hover:bg-orbit-orange-hover` | `#E05D00` | Interactive hover state for orange accents |
| **Dark Background** | `bg-orbit-bg-dark` | `#0A0F1D` | Main dark mode viewport background |
| **Dark Card** | `bg-orbit-card-dark` | `#131B2E` | Card surface container background |
| **Dark Border** | `border-orbit-border-dark` | `#1E2A42` | Divider lines and container borders |

---

## 📄 Application Pages (`app/`)

### 1. Main Dashboard (`app/page.tsx`)
- [x] Update Top Greeting Banner to continuous rotating conic gradient beam with `#0066FF` and `#FF6B00`.
- [x] Update Daily Score Circular Progress Ring to Orbit brand colors.
- [ ] **TODO**: Replace legacy `#1F3B99` and `#6D5BFF` badge & card background references with `bg-orbit-blue/10` and `text-orbit-blue`.

### 2. Today Tasks & Timeline (`app/today/page.tsx`)
- [x] Update timeline progress bar and current time indicator in `TodayTimelineView.tsx` to `bg-orbit-blue` and `text-orbit-orange`.
- [x] Replace legacy indigo/purple task priority badges with `text-orbit-blue` and `text-orbit-orange`.
- [x] Standardize filter tab triggers with standard `Tabs` utility classes.

### 3. Task Management (`app/tasks/page.tsx`)
- [x] Replace hardcoded `#6D5BFF` priority tags and view mode pills with `text-orbit-blue` and `bg-orbit-blue`.
- [x] Update Kanban board column header glows and task drag indicators to Orbit brand standards.
- [x] Standardize edit/delete action triggers and date filter controls.

### 4. Career Roadmap (`app/career/page.tsx` & `app/career/[subjectId]/page.tsx`)
- [x] Update subject progress rings and mastery bars in `SubjectPlanCard.tsx` to `text-orbit-blue` and `text-orbit-orange`.
- [x] Replace legacy `#1F3B99` subject header cards and starter kit buttons with `bg-orbit-blue` and `text-orbit-blue`.
- [x] Update DSA sheet action triggers to Orbit Electric Blue and Glowing Orange.

### 5. Research Projects (`app/research/page.tsx` & `app/research/[projectId]/page.tsx`)
- [x] Standardize project accent color defaults to `#0066FF` (Orbit Blue) and `#FF6B00` (Orbit Orange).
- [x] Replace legacy input focus rings with `focus:ring-orbit-blue`.

### 6. Analytics & Performance (`app/analytics/page.tsx`)
- [x] Update Highcharts line & column chart series stroke/fill colors from legacy purple/indigo to `#0066FF` (Orbit Blue) and `#FF6B00` (Orbit Orange).
- [x] Update productivity stat cards and daily snapshot score breakdowns to Orbit brand tokens.

### 7. Calendar Hub (`app/calendar/page.tsx`)
- [x] Integrate standard Orbit theme palette for work and personal calendar events.

### 8. Clients & Freelance (`app/clients/page.tsx` & `app/clients/[clientId]/page.tsx`)
- [x] Replace legacy status pills with `bg-orbit-blue`.
- [x] Update project theme color maps and focus rings to Orbit standards.

### 9. Goals Tracker (`app/goals/page.tsx`)
- [x] Update milestone progress bars and target goal indicators.

### 10. Habits Tracker (`app/habits/page.tsx`)
- [x] Update streak counter flame icon to `text-orbit-orange`.
- [x] Update daily habit completion button to `bg-orbit-orange` and `shadow-orbit-orange/20`.

### 11. Links & Bookmarks (`app/links/page.tsx`)
- [x] Standardize category tag badges with Orbit standard tokens.

### 12. Notes & Knowledge Base (`app/notes/page.tsx`)
- [x] Update active note selection background to `bg-orbit-blue/5 border-orbit-blue/30`.
- [x] Standardize task conversion trigger button to `border-orbit-blue/30 text-orbit-blue`.

### 13. Weekly Planner (`app/weekly-planner/page.tsx`)
- [x] Update top objective step badges to `bg-orbit-blue`.
- [x] Update weekly score range slider accent to `accent-orbit-blue`.

### 14. Settings & Preferences (`app/settings/page.tsx`)
- [x] Update theme selection cards to reflect the new Orbit Electric Blue + Glowing Orange palette (`border-orbit-blue bg-orbit-blue/10 text-orbit-blue`).

---

## 🧩 Component Modules (`components/`)

### 1. Layout & Navigation (`components/layout/`)
- [x] **`Sidebar.tsx`**: Update active navigation link pill to `bg-orbit-blue text-white shadow-orbit-blue/30` and theme switch toggle!
- [ ] **`Header.tsx`**: Update notification badge indicator dot to `bg-orbit-orange animate-ping`.
- [ ] **`MainLayout.tsx`**: Ensure dark background inherits `bg-orbit-bg-dark`.

### 2. Modals (`components/modals/`)
- [x] **`FocusOverlayModal.tsx`**: Fully updated with `bg-orbit-bg-dark`, `bg-orbit-blue`, `text-orbit-orange`, and breathing radial glows!
- [x] **`QuickAddModal.tsx`**: Updated input focus rings to `focus:ring-orbit-blue` and MIT icon to `text-orbit-orange`.
- [x] **`QuickCaptureModal.tsx`**: Updated capture mode selector tabs and focus rings to Orbit Blue brand tokens.
- [x] **`KeyboardShortcutsModal.tsx`**: Updated shortcut key badge text and icons to `text-orbit-blue`.

### 3. Dashboard Widgets (`components/dashboard/`)
- [x] **`NowFocusCard.tsx`**: Replaced hardcoded `#6D5BFF` & `#1F3B99` NOW badge and timer indicators with `bg-orbit-blue/10` and `text-orbit-blue`.
- [ ] **`DailyScoreBreakdownModal.tsx`**: Update score gauge color gradient to `#0066FF` and `#FF6B00`.

### 4. UI Primitives (`components/ui/`)
- [x] **`Badge.tsx`**: Updated `purple` variant to use `bg-orbit-blue/20 text-orbit-blue border-orbit-blue/30`.
- [x] **`tabs.tsx`**: Standardized badge active pill color to `bg-orbit-blue/10 text-orbit-blue`.
- [x] **`button.tsx`**: Standardized default and link variants to Orbit Blue brand tokens (`bg-orbit-blue text-white shadow-orbit-blue/20`).
- [x] **`input.tsx` & `select.tsx`**: Standardized focus ring utilities to `focus-visible:ring-orbit-blue` and `focus:ring-orbit-blue`.
- [x] **`date-picker.tsx`**: Updated selected date highlight, outline rings, and action text to `orbit-blue`.

### 5. Branding (`components/common/`)
- [x] **`Logo.tsx`**: Confirmed referencing `orbit-dark.png` and `orbit-light.png` with glowing satellite orb animation.

---

## 🚀 Execution Checklist

1. [x] **Core Tokens**: Calibrate `@theme` in `app/globals.css` and `lib/theme.ts`.
2. [x] **Focus Modal**: Update `FocusOverlayModal.tsx` to use brand Tailwind classes.
3. [x] **Top Banner**: Update dashboard greeting banner in `app/page.tsx`.
4. [x] **Phase 1 Modules**: Update `Sidebar.tsx`, `NowFocusCard.tsx`, `QuickAddModal.tsx`, `tabs.tsx`, `TodayTimelineView.tsx`, and `SubjectPlanCard.tsx`.
5. [x] **Phase 2 Pages**: Update `app/today/page.tsx`, `app/tasks/page.tsx`, `app/career/page.tsx`, `app/research/page.tsx`, `app/habits/page.tsx`, `app/notes/page.tsx`, `app/weekly-planner/page.tsx`, `app/settings/page.tsx`, and `app/clients/page.tsx`.
6. [x] **Phase 3 Analytics**: Update chart gradients in `app/analytics/page.tsx`.
