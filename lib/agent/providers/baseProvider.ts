import { z } from 'zod';

export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

export interface LLMProvider {
  id: string; // 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'mock'
  name: string;

  /**
   * Generates raw text completion given a prompt and options.
   */
  generateText(prompt: string, options?: LLMGenerationOptions): Promise<string>;

  /**
   * Generates structured JSON output validated against a Zod schema.
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T>;
}
