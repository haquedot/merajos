'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap } from 'lucide-react';
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl p-[1px] overflow-hidden shadow-md group"
      >
        <div className="relative z-10 p-3.5 rounded-[calc(1rem-1px)] text-xs flex items-start justify-between gap-3 backdrop-blur-md bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-amber-50/90 dark:from-slate-900/95 dark:via-indigo-950/95 dark:to-blue-950/95 border border-blue-200/80 dark:border-blue-800/60 transition-colors">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs tracking-tight">
                Enable Zero-API-Key On-Device AI (Gemini Nano)
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[9px] font-mono border border-blue-300/40 dark:border-blue-400/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                  Chrome Built-In
                </span>
              </p>
              <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                Run Omini 100% locally in your browser with zero latency.
                Enable Chrome flag <code className="px-1.5 py-0.5 bg-blue-100/80 dark:bg-slate-950/80 rounded text-blue-800 dark:text-sky-300 font-mono text-[10px] border border-blue-200 dark:border-white/10">#prompt-api-for-gemini-nano</code> in Chrome 126+.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
