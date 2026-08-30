# Orbit OS ⭐ — Personal AI Operating System & Executive Co-Pilot

> **Plan. Focus. Execute. Grow.**  
> *Built for the micro1 Agentic Workflows Hackathon*

Orbit OS is an intelligent personal operating system powered by an autonomous, multi-agent executive assistant (**Omini AI Co-Pilot**). It decomposes complex natural language intent across **11 core OS domain modules** (Tasks, Projects, Notes, Career, Research, Habits, Goals, Calendar, Links, Weekly, Settings) with 100% zero-overlap calendar guarantees, capacity ceiling guardrails ($\le 7.0$ hours/day), and Bring-Your-Own-Key (BYOK) provider flexibility.

---

## 🚀 Quick Navigation
- [🤖 Omini AI Co-Pilot Architecture](#-omini-ai-co-pilot-architecture)
- [📦 11 OS Domain Modules](#-11-os-domain-modules)
- [🛠️ Detailed Setup & Reproduction Guide](#️-detailed-setup--reproduction-guide)
  - [1. System Prerequisites](#1-system-prerequisites)
  - [2. Installation](#2-installation)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Local LLM Setup (Ollama)](#4-local-llm-setup-ollama)
  - [5. Launching the App](#5-launching-the-app)
- [📊 Evaluation & Benchmark Suite](#-evaluation--benchmark-suite)
- [🔑 BYOK (Bring Your Own Key) Provider Switching](#-byok-bring-your-own-key-provider-switching)
- [🛡️ Verification Guardrails & Human-in-the-Loop](#️-verification-guardrails--human-in-the-loop)
- [📋 Hackathon Deliverables & Architecture Changelog](#-hackathon-deliverables--architecture-changelog)

---

## 🤖 Omini AI Co-Pilot Architecture

Orbit OS transitions away from monolithic AI prompts into a **Registry-Based Modular Agentic Workflow**:

```
[ User Intent Prompt ]
         │
         ▼
[ Co-Pilot API Route (/api/agent/co-pilot) ]
         │
 ┌───────┴────────────────────────┐
 │ Context Builder                │ ➔ Pulls live workspace state across 11 modules
 ├────────────────────────────────┤
 │ Multi-Agent Subagent Engine    │ ➔ TaskSlotAgent, CareerAgent, ResearchAgent
 ├────────────────────────────────┤
 │ Verification Guardrail Engine  │ ➔ Evaluates capacity ceiling (7.0h limit) & MITs
 └───────┬────────────────────────┘
         │
         ▼
[ Executive Action Dispatcher (/api/agent/execute-action) ]
         │
 ┌───────┴────────────────────────────────────────────────────────┐
 │ Domain-Specific Action Handler Registry                        │
 ├───────────┬───────────┬───────────┬───────────┬────────────────┤
 │ Tasks     │ Projects  │ Notes     │ Career    │ Research       │
 │ Habits    │ Goals     │ Calendar  │ Links     │ Weekly Planner │
 │ Settings  │           │           │           │                │
 └───────────┴───────────┴───────────┴───────────┴────────────────┘
```

---

## 📦 11 OS Domain Modules

Omini AI Co-Pilot executes complete CRUD (`CREATE`, `READ`, `UPDATE`, `DELETE`) operations across 11 distinct domains:

1. **Tasks**: Create, schedule, prioritize, and check off daily time-slotted tasks.
2. **Projects**: Manage projects, client deliverables, features, bug fixes, and invoices.
3. **Notes**: Capture knowledge items, meeting memos, and tagged markdown checklists.
4. **Career**: Track DSA topics revision status, subject syllabus checklists, and Job Application pipelines (`Applied` ➔ `Interview` ➔ `Offer`).
5. **Research**: Manage research projects, literature paper reading status (`unread` ➔ `reading` ➔ `cited`), summaries, and section word counts.
6. **Habits**: Log daily habit check-in streaks (`history['YYYY-MM-DD']`) and routine completions.
7. **Goals**: Update goal OKR progress %, check off key milestone sub-targets.
8. **Calendar**: Schedule, reschedule, and manage calendar meetings with zero time collision guarantees.
9. **Links**: Bookmark resource URLs, toggle favorites, and assign tags.
10. **Weekly Planner**: Set top weekly priorities, manage brain dumps, and log week reviews.
11. **Settings**: Switch system theme modes (`dark`, `light`, `system`), pomodoro timer durations, and AI preferences.

---

## 🛠️ Detailed Setup & Reproduction Guide

Follow these exact steps to set up and run Orbit OS from a clean environment.

### 1. System Prerequisites
- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm` (v9+)
- **Database**: MongoDB (Local MongoDB instance or free MongoDB Atlas URI)
- **Local AI Engine (Optional)**: [Ollama](https://ollama.ai/) (v0.1.30+) for local offline inference
- **OS**: Windows, macOS, or Linux

---

### 2. Installation

Clone the repository and install all npm dependencies:

```bash
git clone https://github.com/haquedot/merajos.git
cd merajos
npm install
```

---

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your database and AI provider configurations:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/orbit_os

# AI Provider Options: 'ollama' | 'openai' | 'gemini' | 'claude' | 'groq'
AI_PROVIDER=ollama

# Ollama Configuration (For Local Offline AI Execution)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# Cloud Provider Keys (Optional - Required only if using Cloud Provider)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

---

### 4. Local LLM Setup (Ollama)

If using the default local offline LLM (`ollama`):

1. Install Ollama from [ollama.ai](https://ollama.ai/).
2. Pull the recommended local code model:
```bash
ollama pull qwen2.5-coder:7b
```
3. Start the Ollama server:
```bash
ollama serve
```

---

### 5. Launching the App

Run the Next.js development server:

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

- Click **"Omini Co-Pilot"** in the top navigation bar or press `Cmd+K` / `Ctrl+K` to open the AI Co-Pilot Drawer.
- Type any natural language prompt (e.g., *"Applied for Software Engineer job at Google, mark DP topic as revised, and reschedule tomorrow's meeting to 4 PM"*).

---

## 📊 Evaluation & Benchmark Suite

Run the automated evaluation benchmark suite locally to compare the **Manual Baseline** against the **Agent Solution**:

```bash
npx tsx scripts/eval_benchmark.ts
```

### Benchmark Results (10 Test Cases Summary):

| Metric | Simple Manual Baseline | Orbit Agent Co-Pilot | Change / Delta |
| :--- | :---: | :---: | :---: |
| **Human Time per Task** | 180 – 300 seconds | 1.0 – 1.8 seconds | **99.3% Reduction** ⚡ |
| **Calendar Conflict Rate** | 35.0% | 0.0% | **100% Zero Collisions** 🛡️ |
| **Execution Accuracy** | 80.0% | 100.0% | **+20% Accuracy** 🎯 |
| **Destructive Action Safety** | None | Human Confirmation Prompt | **0 Accidental Deletes** 🔒 |

---

## 🔑 BYOK (Bring Your Own Key) Provider Switching

Orbit OS supports dynamic, runtime provider switching without restarting the server:

1. Open **Settings** in Orbit OS (`http://localhost:3000/settings`).
2. Navigate to the **AI Provider Keys (BYOK)** section.
3. Select your provider (`Ollama`, `OpenAI`, `Google Gemini`, `Claude`, `Groq`), enter your API key, and click **Save Keys**.
4. The system validates the key instantly and routes subsequent Co-Pilot requests to your selected provider.

---

## 🛡️ Verification Guardrails & Human-in-the-Loop

1. **Capacity Ceiling Guardrail**: `verifier.ts` checks total daily scheduled workload against a hard ceiling ($\le 7.0$ hours/day) to prevent burnout.
2. **Deterministic Intent Layer**: Layered regex validation prevents LLM hallucinations (e.g., automatically resolving *"Create feature X in project Y"* to an `UPDATE` on project `"Y"` instead of creating duplicate project documents).
3. **Human Confirmation Safeguard**: Destructive actions (`DELETE`) set `requiresConfirmation: true`. The UI displays a red confirmation warning requiring user sign-off before executing database deletion.

---

## 📋 Hackathon Deliverables & Architecture Changelog

- 📄 **Full Hackathon Analysis Report**: [`docs/HACKATHON_PROJECT_ANALYSIS.md`](docs/HACKATHON_PROJECT_ANALYSIS.md)
- 📄 **Modular Actions Implementation TODOs**: [`docs/ORBIT_OS_MODULAR_AI_ACTIONS_TODOS.md`](docs/ORBIT_OS_MODULAR_AI_ACTIONS_TODOS.md)
- 📄 **Evaluation Trajectories & Benchmark**: [`docs/BENCHMARK_RESULTS.md`](docs/BENCHMARK_RESULTS.md)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **State Management**: Zustand, React Query
- **Styling**: Vanilla CSS, TailwindCSS, Framer Motion, Lucide Icons
- **Database**: MongoDB (Mongoose), Dexie.js (Client Cache)
- **AI Providers**: Ollama, OpenAI, Google Gemini, Anthropic Claude, Groq

---

## 📜 License

MIT License. Built with ❤️ for the micro1 Agentic Workflows Hackathon.
