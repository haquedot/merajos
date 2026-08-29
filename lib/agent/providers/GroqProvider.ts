import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class GroqProvider implements LLMProvider {
  id = 'groq';
  name = 'Groq Cloud (Llama 3.3)';

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'llama-3.3-70b-versatile') {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API Key missing. Please set GROQ_API_KEY in .env.local');
    }

    const messages = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2048,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T> {
    const rawText = await this.generateText(prompt, {
      ...options,
      jsonMode: true,
      systemPrompt: (options?.systemPrompt ? options.systemPrompt + '\n\n' : '') +
        'CRITICAL: Return valid JSON.'
    });

    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return schema.parse(parsed);
  }
}
