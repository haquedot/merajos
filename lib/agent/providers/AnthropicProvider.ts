import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic Claude 3.5 Sonnet';

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API Key missing. Please set ANTHROPIC_API_KEY in .env.local');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.2,
        system: options?.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    return content;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T> {
    const rawText = await this.generateText(prompt, {
      ...options,
      systemPrompt: (options?.systemPrompt ? options.systemPrompt + '\n\n' : '') +
        'CRITICAL: Return valid JSON matching schema only. Output no markdown ticks or intro text.'
    });

    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return schema.parse(parsed);
  }
}
