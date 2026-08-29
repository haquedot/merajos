import { LLMProvider } from './baseProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GroqProvider } from './GroqProvider';
import { OllamaProvider } from './OllamaProvider';
import { MockProvider } from './MockProvider';

export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'mock';

export class ProviderFactory {
  private static instance: LLMProvider | null = null;

  /**
   * Returns the active LLM Provider instance based on:
   * 1. Explicit override passed in parameters
   * 2. `AGENT_MOCK_MODE=true` environment variable -> MockProvider
   * 3. `AI_PROVIDER` environment variable (default: 'gemini')
   */
  public static getProvider(providerId?: AIProviderId): LLMProvider {
    // If offline mock mode is flagged, prioritize MockProvider for benchmark safety
    if (process.env.AGENT_MOCK_MODE === 'true' && !providerId) {
      return new MockProvider();
    }

    const activeId = (providerId || process.env.AI_PROVIDER || 'gemini').toLowerCase() as AIProviderId;

    switch (activeId) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'groq':
        return new GroqProvider();
      case 'ollama':
        return new OllamaProvider();
      case 'mock':
        return new MockProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }

  /**
   * Returns list of available provider options for UI selection in Orbit settings.
   */
  public static getAvailableProviders(): { id: AIProviderId; name: string; requiresKey: boolean }[] {
    return [
      { id: 'gemini', name: 'Google Gemini (Pro/Flash)', requiresKey: true },
      { id: 'openai', name: 'OpenAI (GPT-4o)', requiresKey: true },
      { id: 'anthropic', name: 'Anthropic (Claude 3.5 Sonnet)', requiresKey: true },
      { id: 'groq', name: 'Groq Cloud (Llama 3.3)', requiresKey: true },
      { id: 'ollama', name: 'Ollama (Local Offline)', requiresKey: false },
      { id: 'mock', name: 'Mock Engine (Evaluation & Offline)', requiresKey: false },
    ];
  }
}
