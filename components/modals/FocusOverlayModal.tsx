'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2, X, Sparkles, Volume2, VolumeX, Maximize2, ShieldAlert } from 'lucide-react';

interface FocusOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  category?: string;
  onCompleteTask?: () => void;
}

export const FocusOverlayModal: React.FC<FocusOverlayModalProps> = ({
  isOpen,
  onClose,
  taskTitle = 'Deep Focus Session',
  category = 'General',
  onCompleteTask,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'deepwork' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const initialTimeRef = useRef<number>(25 * 60);

  // Mode changes
  const switchMode = (newMode: 'pomodoro' | 'deepwork' | 'stopwatch') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') {
      initialTimeRef.current = 25 * 60;
      setTimeLeft(25 * 60);
    } else if (newMode === 'deepwork') {
      initialTimeRef.current = 50 * 60;
      setTimeLeft(50 * 60);
    } else {
      setElapsedSeconds(0);
    }
  };

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsedSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  if (!isOpen) return null;

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = mode === 'stopwatch' ? formatTime(elapsedSeconds) : formatTime(timeLeft);
  const progressPercent = mode === 'stopwatch'
    ? 100
    : Math.round(((initialTimeRef.current - timeLeft) / initialTimeRef.current) * 100);

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setElapsedSeconds(0);
    } else {
      setTimeLeft(initialTimeRef.current);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen fixed inset-0 z-50 bg-[#0B1120]/95 backdrop-blur-2xl text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#6D5BFF] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Focus Mode Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute ambience' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Exit Focus Mode (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Main Focus Arena */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-8 z-10 max-w-2xl mx-auto space-y-8">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'pomodoro' ? 'btn-primary shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              25m Pomodoro
            </button>
            <button
              onClick={() => switchMode('deepwork')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'deepwork' ? 'btn-secondary shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              50m Deep Work
            </button>
            <button
              onClick={() => switchMode('stopwatch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'stopwatch' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Stopwatch
            </button>
          </div>

          {/* Active Task Info */}
          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-[#1F3B99]/40 text-blue-200 border border-blue-400/20 text-xs font-semibold">
              {category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-xl">
              {taskTitle}
            </h1>
          </div>

          {/* Huge Timer Counter */}
          <div className="relative flex items-center justify-center my-4">
            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
              {displayTime}
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all active:scale-95 shadow-md cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'btn-primary text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            {onCompleteTask && (
              <button
                onClick={() => {
                  onCompleteTask();
                  onClose();
                }}
                className="p-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                title="Mark Task Complete"
              >
                <CheckCircle2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Distraction Shield Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 z-10">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span>Distraction Shield Active — Single task focus mode</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
