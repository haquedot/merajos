import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class GeminiProvider implements LLMProvider {
  id = 'gemini';
  name = 'Google Gemini 1.5 (Pro/Flash)';

  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API Key missing. Please set GEMINI_API_KEY in .env.local');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${options?.systemPrompt ? options.systemPrompt + '\n\n' : ''}${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxTokens ?? 2048,
          responseMimeType: options?.jsonMode ? 'application/json' : 'text/plain'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return candidateText;
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
        'CRITICAL: Return valid JSON matching the requested schema.'
    });

    // Clean JSON block formatting if present
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return schema.parse(parsed);
  }
}
