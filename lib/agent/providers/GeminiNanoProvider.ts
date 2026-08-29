import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';
import { checkGeminiNanoSupport } from './geminiNanoCheck';

export class GeminiNanoProvider implements LLMProvider {
  id = 'gemini-nano';
  name = 'Gemini Nano (Chrome Built-in On-Device)';

  private session: any = null;

  private async getSession(systemPrompt?: string): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('Gemini Nano is an on-device client AI provider and cannot run in a Node.js server environment.');
    }

    const aiObj = (window as any).ai;
    if (!aiObj || !aiObj.languageModel) {
      throw new Error('Gemini Nano is not available. Please enable chrome://flags/#prompt-api-for-gemini-nano');
    }

    const check = await checkGeminiNanoSupport();
    if (!check.isSupported) {
      throw new Error(`Gemini Nano unavailable: ${check.details}`);
    }

    if (!this.session) {
      this.session = await aiObj.languageModel.create({
        systemPrompt: systemPrompt || 'You are Omini, an AI Assistant for personal productivity OS. Respond with concise structured responses.',
        temperature: 0.2,
      });
    }

    return this.session;
  }

  async generateText(prompt: string, options?: LLMGenerationOptions & { formatJson?: boolean }): Promise<string> {
    const session = await this.getSession(options?.systemPrompt);

    const fullPrompt = options?.systemPrompt
      ? `System instruction: ${options.systemPrompt}\n\nUser Prompt: ${prompt}`
      : prompt;

    const response = await session.prompt(fullPrompt);
    return response || '';
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T> {
    const systemPrompt =
      (options?.systemPrompt ? `${options.systemPrompt}\n\n` : '') +
      'CRITICAL: Respond ONLY with valid JSON matching the user intent. Do not include markdown code blocks or extra text.';

    const rawText = await this.generateText(prompt, {
      ...options,
      systemPrompt,
      formatJson: true,
    });

    try {
      const cleanedJson = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      let parsed = JSON.parse(cleanedJson);

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.response && typeof parsed.response === 'object') parsed = parsed.response;
        else if (parsed.data && typeof parsed.data === 'object') parsed = parsed.data;
        else if (parsed.result && typeof parsed.result === 'object') parsed = parsed.result;
      }

      const validated = schema.parse(parsed);
      return validated;
    } catch (err: any) {
      console.warn(`[GeminiNanoProvider] Fallback parsing warning: ${err.message}`);
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    }
  }

  destroy(): void {
    if (this.session && typeof this.session.destroy === 'function') {
      this.session.destroy();
      this.session = null;
    }
  }
}
