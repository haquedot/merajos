import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class OllamaProvider implements LLMProvider {
  id = 'ollama';
  name = 'Ollama (Local Offline LLM)';

  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || model || 'qwen2.5-coder:7b';
  }

  async generateText(prompt: string, options?: LLMGenerationOptions & { formatJson?: boolean }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${options?.systemPrompt ? options.systemPrompt + '\n\n' : ''}${prompt}`,
        stream: false,
        ...(options?.formatJson ? { format: 'json' } : {}),
        options: {
          temperature: options?.temperature ?? 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T> {
    const rawText = await this.generateText(prompt, {
      ...options,
      formatJson: true,
      systemPrompt: (options?.systemPrompt ? options.systemPrompt + '\n\n' : '') +
        'CRITICAL: Return valid JSON matching schema only.'
    });

    try {
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      let parsed = JSON.parse(cleanedJson);

      // If local LLM wrapped the payload inside a top-level wrapper
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.response && typeof parsed.response === 'object') parsed = parsed.response;
        else if (parsed.data && typeof parsed.data === 'object') parsed = parsed.data;
        else if (parsed.result && typeof parsed.result === 'object') parsed = parsed.result;
      }

      // If local LLM returned an array directly
      if (Array.isArray(parsed)) {
        parsed = { summary: 'Generated task proposals from local LLM', taskProposals: parsed };
      }

      return schema.parse(parsed);
    } catch (err: any) {
      console.warn(`[OllamaProvider] Structured parsing warning on model ${this.model}:`, err.message);
      throw err;
    }
  }
}
