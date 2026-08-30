# Orbit OS: Modular AI Actions Implementation TODOs

- [ ] **Phase 1: Modular Infrastructure & Handler Extraction**
  - [ ] Create `lib/agent/handlers/baseHandler.ts` with standard `ActionHandler` interface.
  - [ ] Create `lib/agent/handlers/tasksActionHandler.ts` for task operations (`CREATE`, `UPDATE`, `DELETE`).
  - [ ] Create `lib/agent/handlers/projectsActionHandler.ts` for projects/clients/features/bugs/invoices.
  - [ ] Create `lib/agent/handlers/notesActionHandler.ts` for notes operations.
  - [ ] Create `lib/agent/handlers/careerActionHandler.ts` for DSA topics and career operations.
  - [ ] Create `lib/agent/handlers/researchActionHandler.ts` for research paper operations.
  - [ ] Create `lib/agent/handlers/habitsActionHandler.ts` for habit tracker operations.
  - [ ] Create `lib/agent/handlers/goalsActionHandler.ts` for goal OKR operations.
  - [ ] Create `lib/agent/handlers/index.ts` handler registry dispatcher.
  - [ ] Refactor `app/api/agent/execute-action/route.ts` to delegate to `dispatchAgentAction`.
  - [ ] Validate type check with `npx tsc --noEmit`.

- [ ] **Phase 2: Calendar & Events AI Integration**
  - [ ] Create `lib/agent/handlers/calendarActionHandler.ts` (`CREATE` event, `UPDATE` reschedule, `DELETE` event).
  - [ ] Update `parseOmniActionProposal` in `lib/agent/orchestrator.ts` to parse calendar prompts.
  - [ ] Update `StructuredSchema` in `app/api/agent/co-pilot/route.ts` for calendar actions.
  - [ ] Test calendar event scheduling via Omini Co-Pilot.

- [ ] **Phase 3: Habits Check-ins & Goal Milestones AI Integration**
  - [ ] Update `habitsActionHandler.ts` to support daily check-ins (`UPDATE` action for `history['YYYY-MM-DD']`).
  - [ ] Update `goalsActionHandler.ts` to support checking off milestones (`UPDATE` action for goal milestones).
  - [ ] Add parsing logic for habit completion and milestone check prompts.

- [ ] **Phase 4: Saved Resource Links AI Integration**
  - [ ] Create `lib/agent/handlers/linksActionHandler.ts` (`CREATE` bookmark, `UPDATE` favorite flag, `DELETE` link).
  - [ ] Update `parseOmniActionProposal` and Zod schema for link bookmarks.
  - [ ] Test resource link bookmarking via Omini Co-Pilot.

- [ ] **Phase 5: Career Subject Plans & Job Applications AI Integration**
  - [ ] Extend `careerActionHandler.ts` to support creating Subject Plans and updating Job Application statuses.
  - [ ] Add parsing logic for subject plans and job application prompts.

- [ ] **Phase 6: Research Paper Status & Writing Progress AI Integration**
  - [ ] Extend `researchActionHandler.ts` to support paper reading status updates (`unread` ➔ `reading` ➔ `cited`) and section word count updates.
  - [ ] Add parsing logic for paper reading state updates.

- [ ] **Phase 7: Weekly Planner & System Settings AI Integration**
  - [ ] Create `lib/agent/handlers/weeklyActionHandler.ts` (`UPDATE` weekly priorities, brain dump).
  - [ ] Create `lib/agent/handlers/settingsActionHandler.ts` (`UPDATE` theme, pomodoro time).
  - [ ] Perform final full-system type check and integration validation.
