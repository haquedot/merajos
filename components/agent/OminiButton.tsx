'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface OminiButtonProps {
  onClick: () => void;
  className?: string;
}

export const OminiButton: React.FC<OminiButtonProps> = ({ onClick, className = '' }) => {
  return (
    <div className={`fixed bottom-20 right-5 sm:bottom-6 sm:right-6 z-[9990] flex items-center justify-center ${className}`}>
      <div className="relative rounded-full p-[2.5px] overflow-hidden group shadow-2xl shadow-orbit-blue/40">
        {/* Continuous Rotating Conic Gradient Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[250%] bg-[conic-gradient(from_0deg_at_50%_50%,#0066FF_0deg,#38bdf8_90deg,transparent_180deg,#FF6B00_270deg,#0066FF_360deg)] opacity-100 pointer-events-none"
        />

        {/* Inner Floating Omini Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          id="tour-agent-copilot"
          onClick={onClick}
          className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-orbit-blue text-white shadow-lg transition-transform cursor-pointer group/btn"
          aria-label="Open Omini AI Co-Pilot"
          title="Open Omini (Alt+J or Ctrl+Shift+O)"
        >
          <Sparkles className="w-5.5 h-5.5 text-amber-300 animate-pulse group-hover/btn:scale-110 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};

export default OminiButton;
