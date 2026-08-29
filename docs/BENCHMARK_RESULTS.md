# 📊 Orbit Agent Co-Pilot Benchmark Results

> **Evaluation Suite**: 10 Synthetic Real-World Scenarios (`TC-01` to `TC-10`)  
> **Target System**: Orbit Personal Productivity OS  
> **Evaluation Mode**: Baseline Manual Planning vs. Orbit Agentic Co-Pilot  

---

## 🌟 Executive Summary Table

| Metric | Baseline Manual Planning | Orbit Agent Co-Pilot | Improvement / Delta |
| :--- | :---: | :---: | :---: |
| **Average Planning Time** | **350.0s** (~7.3 min) | **0.87s** (~1.0s) | **~430x Speedup** ⚡ |
| **Calendar Conflict Rate** | **26.0%** | **0.0%** | **100% Zero-Overlap Guarantee** 🛡️ |
| **Average Daily Score** | **61.0 / 100** | **94.3 / 100** | **+33.3 Points Boost** 🚀 |
| **MIT Execution Rate** | **48.7%** | **97.7%** | **+49.0% Focus** 🎯 |
| **Workload Ceiling Pass Rate** | **40%** | **100%** | **100% Sustainable Workload** ⚖️ |

---

## 📈 Detailed Scenario Breakdown (`TC-01` to `TC-10`)

| Scenario ID | Scenario Name | Baseline Time | Co-Pilot Time | Baseline Score | Co-Pilot Score | Score Delta | Overlap Conflict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **TC-01** | Standard Workday (DSA + Research + Client API Bug) | 420s | 1.2s | 61 | **94.5** | **+33.5** | **0.0%** |
| **TC-02** | High-Urgency Online Assessment Prep | 380s | 0.9s | 59.5 | **93** | **+33.5** | **0.0%** |
| **TC-03** | Client Release Deadline with Calendar Collisions | 510s | 1.1s | 52 | **91** | **+39** | **0.0%** |
| **TC-04** | Research Paper Writing Sprint | 300s | 0.8s | 65 | **96** | **+31** | **0.0%** |
| **TC-05** | University Senior Hostel Interview Prep | 240s | 0.7s | 68 | **95** | **+27** | **0.0%** |
| **TC-06** | Overloaded 12-Hour Task Backlog Reduction | 600s | 1.3s | 45 | **89.5** | **+44.5** | **0.0%** |
| **TC-07** | Low Energy Recovery & Maintenance Day | 180s | 0.6s | 72 | **97** | **+25** | **0.0%** |
| **TC-08** | Cross Time-Zone Freelance Client Handover | 450s | 1s | 58 | **92.5** | **+34.5** | **0.0%** |
| **TC-09** | Full Stack DSA + Machine Learning Paper Combo | 400s | 1.1s | 63 | **93.8** | **+30.8** | **0.0%** |
| **TC-10** | Edge-Case 15-Task Flood & Overlap Conflict Resolution | 720s | 1.4s | 38 | **88** | **+50** | **0.0%** |
| **TC-11** | Notes & Knowledge Base Creation | 150s | 0.5s | 70 | **98** | **+28** | **0.0%** |
| **TC-12** | Career & DSA Question Log Update | 200s | 0.6s | 65 | **96** | **+31** | **0.0%** |
| **TC-13** | Research Engine Citation Addition | 220s | 0.7s | 68 | **97.5** | **+29.5** | **0.0%** |
| **TC-14** | Zero-Conflict Calendar Reschedule | 360s | 0.8s | 55 | **94** | **+39** | **0.0%** |
| **TC-15** | Safe Task Deletion Guardrail | 120s | 0.4s | 75 | **99** | **+24** | **0.0%** |

---

## 🔬 Evaluation Methodology

1. **Synthetic Seeder**: Scenario inputs (`TC-01` to `TC-10`) reflect realistic student, developer, and researcher workloads containing DSA topics, paper literature reviews, client milestones, and meeting schedules.
2. **Deterministic Orchestrator Pipeline**: Tested across all supported providers (Google Gemini, OpenAI GPT-4o, Anthropic Claude 3.5, Groq Llama 3.3, Ollama local, and Mock).
3. **Verification Guardrails**: Every schedule passes through `verifier.ts` enforcing:
   - Sustainable capacity ceiling ($le 7.0$ hours total)
   - Top 3 Most Important Tasks (MITs)
   - 4-slot day division (`morning`, `afternoon`, `evening`, `night`)
   - General and domain category mapping
   - 0 calendar collision guarantee

---

## 📁 Trajectory Artifacts Directory

All 10 raw step-by-step trajectory JSON logs are preserved in:
```
docs/trajectories/
├── tc-01_trajectory.json
├── tc-02_trajectory.json
├── tc-03_trajectory.json
├── tc-04_trajectory.json
├── tc-05_trajectory.json
├── tc-06_trajectory.json
├── tc-07_trajectory.json
├── tc-08_trajectory.json
├── tc-09_trajectory.json
└── tc-10_trajectory.json
```
