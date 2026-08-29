'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { checkGeminiNanoSupport, GeminiNanoCapability } from '../../lib/agent/providers/geminiNanoCheck';

export const GeminiNanoBanner: React.FC = () => {
  const [capability, setCapability] = useState<GeminiNanoCapability | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkGeminiNanoSupport().then((status) => {
      setCapability(status);
    });
  }, []);

  if (dismissed || !capability || capability.isSupported) {
    return null;
  }

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/40 border border-indigo-500/30 text-xs text-gray-200 flex items-start justify-between gap-3 shadow-md">
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            Enable Zero-API-Key On-Device AI (Gemini Nano)
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Run Omini Co-Pilot 100% locally in your browser with zero latency and zero API keys.
            Enable Chrome flags <code className="px-1 py-0.5 bg-black/40 rounded text-purple-300 font-mono text-[10px]">#prompt-api-for-gemini-nano</code> in Chrome 126+.
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
