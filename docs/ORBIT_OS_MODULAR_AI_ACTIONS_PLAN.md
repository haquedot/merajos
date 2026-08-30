# Orbit OS: Modular AI Actions Implementation Plan

## 🎯 Goal
Achieve **100% AI action execution parity** across all 11 Orbit OS workspace modules by establishing a clean, modular **Action Handler Registry** architecture (`lib/agent/handlers/`) and implementing full CRUD handlers for Calendar, Links, Weekly Planner, Settings, and Sub-Resources.

---

## 🏗️ Modular Architecture Design

Instead of maintaining a monolithic `app/api/agent/execute-action/route.ts` file, we decouple execution logic into modular, domain-specific handler files:

```
e:\meraj-os\lib\agent\handlers\
├── baseHandler.ts           # Unified ActionHandler interface & helper utilities
├── tasksActionHandler.ts    # Tasks CREATE / UPDATE / DELETE
├── projectsActionHandler.ts # Projects, Clients, Features, Bugs, Invoices
├── notesActionHandler.ts    # Notes CREATE / UPDATE / DELETE
├── careerActionHandler.ts   # DSA topics, Subject Plans, Job Applications
├── researchActionHandler.ts # Research projects, Sections, Paper status
├── habitsActionHandler.ts   # Habit creation & daily check-ins
├── goalsActionHandler.ts    # Goal creation & milestone checks
├── calendarActionHandler.ts # Calendar event scheduling & rescheduling
├── linksActionHandler.ts    # Bookmark links creation & favoriting
├── weeklyActionHandler.ts   # Weekly plan priorities & review logs
├── settingsActionHandler.ts # Workspace theme & pomodoro timer settings
└── index.ts                 # Handler Registry Dispatcher
```

### Clean Dispatcher Pattern (`index.ts`)
```ts
export async function dispatchAgentAction(action: AgentActionProposal, userId: string): Promise<unknown> {
  const handler = handlerRegistry[action.module];
  if (!handler) throw new Error(`Unsupported module: ${action.module}`);
  return handler.execute(action, userId);
}
```

---

## 🚀 Phased Implementation Strategy

### Phase 1: Modular Infrastructure & Handler Extraction
- Create `lib/agent/handlers/baseHandler.ts` and define `ActionHandler` interface.
- Extract existing handlers (`tasks`, `projects`, `notes`, `career`, `research`, `habits`, `goals`) into separate files.
- Refactor `app/api/agent/execute-action/route.ts` into a lightweight 30-line API dispatcher route.

### Phase 2: Calendar & Events AI Integration
- Create `lib/agent/handlers/calendarActionHandler.ts` to execute `CalendarEvent` `CREATE`, `UPDATE` (reschedule time/date), and `DELETE`.
- Update `parseOmniActionProposal` in `orchestrator.ts` and Zod schema in `co-pilot/route.ts` to parse calendar scheduling commands.

### Phase 3: Habits Check-ins & Goal Milestones AI Integration
- Upgrade `habitsActionHandler.ts` to handle `UPDATE` actions (log daily habit check-ins in `history['YYYY-MM-DD']`).
- Upgrade `goalsActionHandler.ts` to handle `UPDATE` actions (check off goal milestone items and recalculate progress %).

### Phase 4: Saved Resource Links AI Integration
- Create `lib/agent/handlers/linksActionHandler.ts` to execute `SavedLink` `CREATE`, `UPDATE` (toggle favorite flag), and `DELETE`.
- Add prompt parsing rules for link bookmarks.

### Phase 5: Career Subject Plans & Job Applications AI Integration
- Extend `careerActionHandler.ts` to handle `CREATE` Subject Plans and `UPDATE` Job Application pipeline status (`Applied` ➔ `Interview` ➔ `Offer`).

### Phase 6: Research Paper Status & Writing Progress AI Integration
- Extend `researchActionHandler.ts` to handle `UPDATE` paper status (`unread` ➔ `reading` ➔ `cited`) and section word count updates.

### Phase 7: Weekly Planner & System Settings AI Integration
- Create `lib/agent/handlers/weeklyActionHandler.ts` (`UPDATE` top priorities, brain dump).
- Create `lib/agent/handlers/settingsActionHandler.ts` (`UPDATE` theme, pomodoro focus time).

---

## 🔍 Verification Plan
1. **Type Checking**: Run `npx tsc --noEmit` after each phase.
2. **Execution Test**: Verify prompt execution for every module in Omini Co-Pilot UI drawer.
3. **Git Hygiene**: Atomic commits per phase.
