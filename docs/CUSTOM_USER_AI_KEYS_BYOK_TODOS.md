# Custom User AI Keys & Dynamic Model Router (BYOK) - Phased Task List

This document tracks the step-by-step implementation of **Bring Your Own Key (BYOK)** for custom AI providers and model selection in Orbit OS.

---

## Phase 1: Security Obfuscation & AI Configuration State Store

**Goal**: Establish data models, encryption/masking utilities, and Zustand state management for custom user AI keys.

- [x] **Task 1.1**: Extend `lib/agent/types.ts` with `UserAIModelConfig` interface:
  ```ts
  export interface UserAIModelConfig {
    id: string;
    providerId: 'openai' | 'anthropic' | 'gemini' | 'groq' | 'ollama';
    name: string; // e.g. "Work GPT-4o"
    modelName: string; // e.g. "gpt-4o", "claude-3-5-sonnet-20241022", "gemini-1.5-pro", "llama-3.3-70b-versatile"
    apiKey: string;
    baseUrl?: string;
    isActive?: boolean;
    createdAt: string;
  }
  ```
- [x] **Task 1.2**: Create `lib/security/keyCrypto.ts` helper utilities for client-side API key obfuscation (`obfuscateKey`, `deobfuscateKey`, `maskKeyDisplay`).
- [x] **Task 1.3**: Implement `store/useAIConfigStore.ts` using Zustand to manage model CRUD operations (`addModelConfig`, `updateModelConfig`, `deleteModelConfig`, `setActiveModelConfig`, `getAvailableModels`).

---

## Phase 2: Settings UI - Custom AI Provider Management Panel

**Goal**: Build a secure management interface in `app/settings/page.tsx` for adding, editing, validating, and deleting custom AI model keys.

- [x] **Task 2.1**: Create `components/settings/CustomAISettingsPanel.tsx`:
  - Visual list of added provider keys with masked display (e.g. `sk-proj-••••••••4A91`).
  - Active model indicator badge.
  - "Add Custom Model" button opening an interactive modal / inline form.
- [x] **Task 2.2**: Build model addition modal/form fields:
  - Provider Selector: OpenAI, Anthropic, Google Gemini, Groq, Custom Ollama.
  - Friendly Name (e.g., *My Groq Llama 3.3 Key*).
  - Model Name ID input (e.g., `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`, `llama-3.3-70b-versatile`).
  - Secret API Key Input with password visibility toggle.
  - Optional Custom Base URL input (for local/self-hosted Ollama).
  - Connection Test endpoint button.
- [x] **Task 2.3**: Embed `CustomAISettingsPanel` into `app/settings/page.tsx`.

---

## Phase 3: Dynamic Provider Factory & Server-Side API Handler

**Goal**: Update the server execution pipeline to accept user-provided API keys and model names dynamically without relying on backend environment keys.

- [x] **Task 3.1**: Update `lib/agent/providers/providerFactory.ts`:
  - Enhance `ProviderFactory.getProvider(providerId, userConfig)` to pass `apiKey`, `modelName`, and `baseUrl` dynamically to `GeminiProvider`, `OpenAIProvider`, `AnthropicProvider`, `GroqProvider`, and `OllamaProvider`.
- [x] **Task 3.2**: Update LLM Providers (`GeminiProvider`, `OpenAIProvider`, `AnthropicProvider`, `GroqProvider`, `OllamaProvider`) to construct API clients with user-provided keys when passed.
- [x] **Task 3.3**: Update `app/api/agent/co-pilot/route.ts`:
  - Accept `userConfig` object in the request body.
  - Initialize the dynamic provider using the user's key/model credentials.

---

## Phase 4: Dynamic Drawer Model Dropdown Filtering

**Goal**: Update `AgentCoPilotDrawer.tsx` to display ONLY configured user models + Gemini Nano + Ollama (in local environment).

- [x] **Task 4.1**: Refactor model dropdown selection in `components/agent/AgentCoPilotDrawer.tsx` to filter available choices to ONLY configured user models + Gemini Nano.
- [x] **Task 4.2**: Implement local environment detection (`localhost`/`127.0.0.1` or `NODE_ENV === 'development'`) to conditionally include `🦙 Ollama (Local Offline)` in dropdown options.
- [x] **Task 4.3**: Pass `userConfig` in `handleSendMessage` fetch body to `/api/agent/co-pilot` request body.

---

## Phase 5: Verification & Remote Git Deployment

**Goal**: Validate custom key configuration, model switching, local environment detection, type checking, and remote push.

- [x] **Task 5.1**: Test adding custom models (Gemini, Groq, OpenAI).
- [x] **Task 5.2**: Test selecting user models in Co-Pilot drawer and running queries.
- [x] **Task 5.3**: Verify Ollama availability in local environment vs production mode.
- [x] **Task 5.4**: Run `npx tsc --noEmit` to verify type checking with zero errors.
- [x] **Task 5.5**: Commit and push branch to remote repository.
