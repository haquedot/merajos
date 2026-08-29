import { z } from 'zod';
import { LLMProvider, LLMGenerationOptions } from './baseProvider';

export class MockProvider implements LLMProvider {
  id = 'mock';
  name = 'Deterministic Mock Provider';

  async generateText(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    return `[Mock Response] Processed query: "${prompt.slice(0, 60)}..." successfully using deterministic mock rules.`;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: LLMGenerationOptions
  ): Promise<T> {
    // Generate a fallback mock object if schema parsing is requested
    const mockData = {
      summary: 'Mock execution plan generated for evaluation benchmark.',
      taskProposals: [
        {
          title: 'Master Trees & Graphs DSA Practice',
          category: 'Career',
          estimatedHours: 1.5,
          priority: 'high',
          mit: true,
          timeSlot: 'morning',
          reason: 'Stale DSA topic needing revision'
        },
        {
          title: 'Read Transformer Architecture Paper',
          category: 'Research',
          estimatedHours: 1.0,
          priority: 'medium',
          mit: true,
          timeSlot: 'afternoon',
          reason: 'High-priority paper in research queue'
        },
        {
          title: 'Sprint Deliverable: Client API Fix',
          category: 'Client',
          estimatedHours: 2.0,
          priority: 'urgent',
          mit: true,
          timeSlot: 'morning',
          reason: 'Client milestone due today'
        }
      ],
      warnings: []
    };

    try {
      return schema.parse(mockData);
    } catch {
      // Return raw parsed object if fallback schema varies
      return mockData as unknown as T;
    }
  }
}
