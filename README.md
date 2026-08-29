# Orbit ⭐ — Agentic Productivity OS & Co-Pilot

> **Plan. Focus. Execute. Grow.**

Orbit is an intelligent personal productivity command center powered by an autonomous, multi-agent workflow (**Orbit Agent Co-Pilot**). It helps students, developers, researchers, and professionals plan their day, balance deep work, resolve calendar collisions, and execute goals with zero friction.

---

## 🤖 Orbit Agent Co-Pilot (micro1 Agentic Workflows Hackathon Project)

Orbit features a Human-in-the-Loop (HITL) multi-agent schedule orchestrator with 100% zero-overlap calendar guarantees and dynamic workload ceilings ($\le 7.0$ hours/day).

### Key Agentic Innovations
- 🧠 **Multi-Provider AI Engine**: Native support for **Ollama (local `qwen2.5-coder:7b` / `llama3.1`)**, Google Gemini, OpenAI GPT-4o, Anthropic Claude 3.5, and Groq.
- ⚡ **Multi-Agent Pipeline**: Specialized sub-agents (`CareerAgent`, `ResearchAgent`, `TaskSlotAgent`, `OrbitVerificationGuardrailAgent`) parse context and optimize 4 daily time-slots (`morning`, `afternoon`, `evening`, `night`).
- 🎯 **Strict Intent & General Category Guardrails**: Honors natural language directives (e.g. *"Create a task for tomorrow afternoon to prepare for senior hostel interview"*), mapping dates, timeslots, and categories (`College`, `Career`, `Research`, `Client`, `Habit`, `Personal`, `General`).
- 🛡️ **Verification Guardrail Engine**: Evaluates capacity ceilings, 0 meeting collision guarantees, and Top 3 Most Important Tasks (MITs) before proposal presentation.
- 📊 **Run Trajectory History**: Complete audit history of past runs and status tracking (`generated` vs. `approved`).

---

## 📊 Benchmark Results Summary

Tested across **10 authentic real-world scenarios** (`TC-01` to `TC-10`):

| Metric | Baseline Manual Planning | Orbit Agent Co-Pilot | Improvement / Delta |
| :--- | :---: | :---: | :---: |
| **Average Planning Time** | **420.0s** (~7.3 min) | **1.01s** (~1.0s) | **~430x Speedup** ⚡ |
| **Calendar Conflict Rate** | **35.0%** | **0.0%** | **100% Zero-Overlap Guarantee** 🛡️ |
| **Average Daily Score** | **58.1 / 100** | **93.0 / 100** | **+34.9 Points Boost** 🚀 |
| **MIT Execution Rate** | **45.5%** | **97.0%** | **+51.5% Focus** 🎯 |

*Full evaluation methodology and trajectory logs are documented in [`docs/BENCHMARK_RESULTS.md`](docs/BENCHMARK_RESULTS.md) and [`docs/trajectories/`](docs/trajectories/).*

---

## 🚀 Single-Command Benchmark Evaluation

Run the automated evaluation suite locally:

```bash
npx tsx scripts/eval_benchmark.ts
```

---

## ⚡ Getting Started

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Configuration**:
Copy `.env.example` to `.env.local` and specify your AI Provider (default: `ollama`):
```env
AI_PROVIDER=ollama
OLLAMA_MODEL=qwen2.5-coder:7b
OLLAMA_BASE_URL=http://localhost:11434
```

3. **Run Development Server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to launch Orbit and press `Cmd+K` or click **"Orbit Co-Pilot"** in the header to activate the agent drawer!

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Agent Orchestrator**: Custom Multi-Agent Pipeline (`CareerAgent`, `ResearchAgent`, `TaskSlotAgent`, `VerifierAgent`)
- **AI Providers**: Ollama, Google Gemini, OpenAI GPT-4o, Anthropic Claude, Groq
- **Styling**: Vanilla CSS, TailwindCSS, Lucide Icons, Framer Motion
- **Database**: MongoDB (Server Snapshots), Dexie.js (Client IndexedDB Cache)
- **Integrations**: Google Tasks API, Google Calendar API
