import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class OllamaProvider implements LLMProvider {
  id = 'ollama';
  name = 'Ollama (Local Offline LLM)';

  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model: string = 'llama3') {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${options?.systemPrompt ? options.systemPrompt + '\n\n' : ''}${prompt}`,
        stream: false,
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
      systemPrompt: (options?.systemPrompt ? options.systemPrompt + '\n\n' : '') +
        'CRITICAL: Return valid JSON matching schema only.'
    });

    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return schema.parse(parsed);
  }
}
