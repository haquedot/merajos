# 📋 Gemini Nano (Chrome Built-in AI) Integration TODO Checklist

> **Objective**: Implement native, zero-API-key on-device AI for Orbit OS and Omini via Chrome's built-in Gemini Nano (`window.ai.languageModel`) with automatic fallback to Ollama.

---

## 🏗️ Phase 1: Browser Capability Detection & Setup Helper (Day 1)

- [ ] **Task 1.1: Create Gemini Nano Capability Helper (`lib/agent/providers/geminiNanoCheck.ts`)**
  - Implement `checkGeminiNanoSupport()` to probe `window.ai` and `window.ai.languageModel.capabilities()`.
  - Export status types: `'readily' | 'after-download' | 'no'`.
  - Handle SSR safety check (`typeof window !== 'undefined'`).

- [ ] **Task 1.2: User Setup Notification Component (`components/agent/GeminiNanoBanner.tsx`)**
  - Build a dismissible banner showing Chrome flag status (`#prompt-api-for-gemini-nano`).
  - Provide a 1-click guide for enabling Chrome Built-in AI flags.

---

## 💻 Phase 2: Client-Side Provider Implementation (Day 2)

- [ ] **Task 2.1: Build `GeminiNanoProvider` (`lib/agent/providers/GeminiNanoProvider.ts`)**
  - Implement `BaseAgentProvider` interface.
  - Implement session initialization via `window.ai.languageModel.create()`.
  - Configure system prompts for Omini intent extraction.
  - Add structured JSON output parsing from `session.prompt()` stream.

- [ ] **Task 2.2: Implement Stream & Error Handling**
  - Catch model download states (`after-download` event).
  - Add graceful error boundary when model session fails or resets.

---

## ⚙️ Phase 3: Provider Registry & Orchestrator Integration (Day 3)

- [ ] **Task 3.1: Update Provider Registry (`lib/agent/providers/providerRegistry.ts`)**
  - Register `'gemini-nano'` as a recognized provider key.
  - Set `'gemini-nano'` as top-priority local provider when browser capability is detected.

- [ ] **Task 3.2: Update Omini Route & Orchestrator (`app/api/agent/co-pilot/route.ts`)**
  - Support client-side execution option when provider selected is `'gemini-nano'`.
  - Ensure server fallback to Ollama if client request indicates Nano unavailable.

---

## 🎨 Phase 4: Frontend UI & Provider Selector (Day 4)

- [ ] **Task 4.1: Update Omini Drawer UI (`components/agent/AgentCoPilotDrawer.tsx`)**
  - Add **"🔮 Gemini Nano (Built-in On-Device)"** option to provider dropdown.
  - Display badge: **"Zero API Key / 100% On-Device"** when Gemini Nano is active.
  - Update reasoning log steps to highlight on-device inference execution time (~200ms).

- [ ] **Task 4.2: Client-Side Direct Execution Flow**
  - Bypass `/api/agent/co-pilot` HTTP fetch when Gemini Nano is active to generate proposals 100% locally in browser JS.

---

## 📊 Phase 5: Benchmark & Trajectory Auditing (Day 5)

- [ ] **Task 5.1: Extend Benchmark Runner (`scripts/eval_benchmark.ts`)**
  - Add Gemini Nano performance metric tracking (latency ms, schema accuracy %).
  - Compare baseline Ollama 7B vs Gemini Nano on-device parsing.

- [ ] **Task 5.2: Verification Checklist**
  - Verify zero API keys required across fresh browser sessions.
  - Verify complete offline operation (disconnect Wi-Fi and execute Omini directives).

---

## 🛠️ Verification Matrix

| Test Step | Target Behavior | Status |
| :--- | :--- | :--- |
| **Flag Detection** | Detects `window.ai` in Chrome 126+ with flags enabled | Pending |
| **Zero API Key** | Generates proposal with zero server key or network call | Pending |
| **Offline Mode** | Parses prompt & executes action proposal while offline | Pending |
| **Fallback** | Automatically uses Ollama if Chrome flags disabled | Pending |

---
*Created for Orbit ⭐ | Next-Gen AI Personal Productivity OS Gemini Nano TODO Checklist*
