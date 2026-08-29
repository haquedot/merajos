/**
 * Utility helper for detecting Chrome Built-in AI (Gemini Nano) capability.
 * Operates client-side with zero dependencies and safe SSR fallbacks.
 */

export interface GeminiNanoCapability {
  isSupported: boolean;
  availability: 'readily' | 'after-download' | 'no';
  details: string;
}

export async function checkGeminiNanoSupport(): Promise<GeminiNanoCapability> {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      availability: 'no',
      details: 'SSR / Server-side execution'
    };
  }

  // Check for window.ai or chrome.aiPrompt API
  const aiObj = (window as any).ai;

  if (!aiObj || !aiObj.languageModel) {
    return {
      isSupported: false,
      availability: 'no',
      details: 'Chrome Built-in AI flags not enabled (#prompt-api-for-gemini-nano)'
    };
  }

  try {
    const capabilities = await aiObj.languageModel.capabilities();
    const availability = capabilities.available || 'no';

    return {
      isSupported: availability !== 'no',
      availability,
      details:
        availability === 'readily'
          ? 'Gemini Nano is active and ready on device'
          : availability === 'after-download'
          ? 'Gemini Nano model downloading in Chrome background'
          : 'Gemini Nano is not available on this device'
    };
  } catch (error: any) {
    return {
      isSupported: false,
      availability: 'no',
      details: error?.message || 'Error checking Gemini Nano capabilities'
    };
  }
}
