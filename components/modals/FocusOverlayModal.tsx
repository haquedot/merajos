'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShieldAlert,
  CloudRain,
  Waves,
  Coffee,
  BellRing,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { getAuthHeaders } from '../../lib/authCheck';

interface FocusOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  category?: string;
  onCompleteTask?: () => void;
}

type AmbientTrack = 'off' | 'rain' | 'ocean' | 'pinknoise';

// Web Audio API Synthesizer (No external assets required)
class FocusAudioSynth {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;

  public initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  playChime(type: 'start' | 'pause' | 'complete') {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (type === 'start') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'pause') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'complete') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.12);
        g.gain.setValueAtTime(0.2, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.0);
        o.connect(g);
        g.connect(this.ctx!.destination);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 1.0);
      });
    }
  }

  startAmbient(sound: AmbientTrack) {
    this.stopAmbient();
    if (sound === 'off') return;

    this.initCtx();
    if (!this.ctx) return;

    // Create 5-second white noise buffer
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (sound === 'rain') {
      // Gentle Rain: Lowpass filter at 1200Hz
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(gain);
    } else if (sound === 'ocean') {
      // Ocean Waves: Lowpass filter modulated by LFO (Sine wave ~0.15Hz for rolling swells)
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(gain);
    } else if (sound === 'pinknoise') {
      // Warm Pink/Brown Noise: Lowpass at 600Hz
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(gain);
    }

    gain.connect(this.ctx.destination);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
    this.gainNode = gain;
  }

  stopAmbient() {
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
      } catch (e) {}
      this.lfoNode = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch (e) {}
      this.noiseNode = null;
    }
  }
}

const synth = new FocusAudioSynth();

export const FocusOverlayModal: React.FC<FocusOverlayModalProps> = ({
  isOpen,
  onClose,
  taskTitle = 'Deep Focus Session',
  category = 'General',
  onCompleteTask,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'deepwork' | 'stopwatch' | 'break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [tickEnabled, setTickEnabled] = useState<boolean>(true);
  const [ambientTrack, setAmbientTrack] = useState<AmbientTrack>('off');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sessionFocusMinutes, setSessionFocusMinutes] = useState<number>(0);

  const initialTimeRef = useRef<number>(25 * 60);

  // Request Desktop Notification Permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Ambient track change handler with explicit Web Audio context resumption
  const handleSelectAmbient = (track: AmbientTrack) => {
    synth.initCtx();
    setAmbientTrack(track);
    if (!soundEnabled || track === 'off') {
      synth.stopAmbient();
    } else {
      synth.startAmbient(track);
    }
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    synth.initCtx();
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    if (!nextSound) {
      synth.stopAmbient();
    } else if (ambientTrack !== 'off') {
      synth.startAmbient(ambientTrack);
    }
  };

  // Mode changes
  const switchMode = (newMode: 'pomodoro' | 'deepwork' | 'stopwatch' | 'break', durationMins?: number) => {
    setIsRunning(false);
    synth.stopAmbient();
    setMode(newMode);

    let secs = 25 * 60;
    if (durationMins) {
      secs = durationMins * 60;
    } else if (newMode === 'pomodoro') {
      secs = 25 * 60;
    } else if (newMode === 'deepwork') {
      secs = 50 * 60;
    } else if (newMode === 'break') {
      secs = 5 * 60;
    }

    if (newMode === 'stopwatch') {
      setElapsedSeconds(0);
    } else {
      initialTimeRef.current = secs;
      setTimeLeft(secs);
    }
  };

  // Log focus session API integration
  const logFocusSessionAPI = useCallback(async (minutesSpent: number) => {
    if (minutesSpent <= 0) return;
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          type: 'focus_session',
          durationMinutes: minutesSpent,
          taskTitle,
          category,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.warn('[FocusModal] Analytics sync skipped offline', e);
    }
  }, [taskTitle, category]);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (soundEnabled && tickEnabled) {
          synth.playTick();
        }
        if (mode === 'stopwatch') {
          setElapsedSeconds((prev) => {
            const next = prev + 1;
            if (next % 60 === 0) setSessionFocusMinutes((m) => m + 1);
            return next;
          });
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              synth.stopAmbient();
              if (soundEnabled) synth.playChime('complete');

              // Trigger Desktop Notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Focus Session Complete! 🎉', {
                  body: `Great job focusing on "${taskTitle}". Take a break!`,
                  icon: '/icon.png',
                });
              }

              // Log session API
              const minutesCompleted = Math.round(initialTimeRef.current / 60);
              logFocusSessionAPI(minutesCompleted);

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
  }, [isRunning, mode, soundEnabled, tickEnabled, taskTitle, logFocusSessionAPI]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Keyboard Hotkeys Handler (Space, R, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, soundEnabled]);

  if (!isOpen) return null;

  const togglePlayPause = () => {
    synth.initCtx();
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (soundEnabled) {
      synth.playChime(nextState ? 'start' : 'pause');
      if (nextState && tickEnabled) {
        synth.playTick();
      }
    }
  };

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = mode === 'stopwatch' ? formatTime(elapsedSeconds) : formatTime(timeLeft);
  const progressPercent =
    mode === 'stopwatch'
      ? 100
      : Math.round(((initialTimeRef.current - timeLeft) / initialTimeRef.current) * 100);

  const handleReset = () => {
    setIsRunning(false);
    synth.stopAmbient();
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
        className="min-h-screen fixed inset-0 z-50 bg-orbit-bg-dark/95 backdrop-blur-2xl text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto max-h-screen"
      >
        {/* Multi-Layer Animated Radial Breathing Glow */}
        <motion.div
          animate={
            isRunning
              ? { scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }
              : { scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }
          }
          transition={{ duration: isRunning ? 3.5 : 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-gradient-to-br from-orbit-blue/30 via-orbit-blue-dark/20 to-orbit-orange/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={
            isRunning
              ? { rotate: 360, scale: [1, 1.15, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[420px] h-[250px] sm:h-[420px] bg-gradient-to-tr from-orbit-orange/20 via-transparent to-orbit-blue/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 z-10 w-full">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orbit-orange animate-ping" />
            <Badge variant="purple" size="sm" className="bg-orbit-blue/20 text-orbit-blue font-bold uppercase tracking-wider text-[11px] sm:text-xs border-orbit-blue/30">
              Orbit Deep Focus Active
            </Badge>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
            {/* Ambient Sound Switcher using Tabs UI */}
            <div className="flex items-center gap-1.5">
              <Tabs
                value={ambientTrack}
                onValueChange={(val) => handleSelectAmbient(val as AmbientTrack)}
                className="w-max sm:w-auto space-y-0 flex justify-center"
              >
                <TabsList className="bg-white/10 border border-white/15 h-auto p-1 max-w-full w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center justify-start sm:justify-center gap-1 shrink-0">
                  <TabsTrigger value="off" className="text-[8px] sm:text-[11px] px-2 py-1 sm:px-2.5 sm:py-1.5 shrink-0">
                    Quiet
                  </TabsTrigger>
                  <TabsTrigger value="rain" className="text-[8px] sm:text-[11px] px-2 py-1 sm:px-2.5 sm:py-1.5 shrink-0">
                    <CloudRain className="w-3 h-3" />
                    <span>Rain</span>
                  </TabsTrigger>
                  <TabsTrigger value="ocean" className="text-[8px] sm:text-[11px] px-2 py-1 sm:px-2.5 sm:py-1.5 shrink-0">
                    <Waves className="w-3 h-3" />
                    <span>Waves</span>
                  </TabsTrigger>
                  <TabsTrigger value="pinknoise" className="text-[8px] sm:text-[11px] px-2 py-1 sm:px-2.5 sm:py-1.5 shrink-0">
                    <Coffee className="w-3 h-3" />
                    <span>Lo-Fi</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Animated Sound Equalizer Visualizer */}
              {ambientTrack !== 'off' && (
                <div className="flex items-center gap-0.5 px-1 h-3">
                  <motion.span animate={{ height: ['30%', '100%', '40%'] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} className="w-0.5 bg-orbit-orange rounded-full" />
                  <motion.span animate={{ height: ['80%', '20%', '90%'] }} transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }} className="w-0.5 bg-orbit-blue rounded-full" />
                  <motion.span animate={{ height: ['40%', '90%', '30%'] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} className="w-0.5 bg-orbit-orange rounded-full" />
                </div>
              )}
            </div>

            {/* Mute Chimes */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleSound}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
            </Button>

            {/* Clock Ticking Sound Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                synth.initCtx();
                setTickEnabled(!tickEnabled);
              }}
              className={`border-white/10 ${
                tickEnabled && soundEnabled ? 'bg-orbit-blue/20 hover:bg-orbit-blue/30 text-orbit-blue border-orbit-blue/30' : 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300'
              }`}
              title={tickEnabled ? 'Disable clock ticking sound' : 'Enable clock ticking sound'}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="w-9 h-9 bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>

            {/* Exit Overlay */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                synth.stopAmbient();
                onClose();
              }}
              className="w-9 h-9 bg-white/5 border-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300"
              title="Exit Focus Mode (Esc)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Center Main Focus Arena */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-4 z-10 max-w-2xl mx-auto space-y-4 sm:space-y-7 w-full px-2">
          {/* Mode Selector using standard Tabs UI Primitive */}
          <Tabs
            value={mode}
            onValueChange={(val) => switchMode(val as any)}
            className="w-full max-w-full space-y-0 flex justify-center"
          >
            <TabsList className="bg-white/10 border border-white/15 h-auto p-1.5 max-w-full w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center justify-start sm:justify-center gap-1 shrink-0">
              <TabsTrigger
                value="pomodoro"
                className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 font-bold"
              >
                25m Pomodoro
              </TabsTrigger>
              <TabsTrigger
                value="deepwork"
                className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 font-bold"
              >
                50m Deep Work
              </TabsTrigger>
              <TabsTrigger
                value="break"
                className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 font-bold"
              >
                5m Short Break
              </TabsTrigger>
              <TabsTrigger
                value="stopwatch"
                className="text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 font-bold"
              >
                Stopwatch
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Active Task Info with Animated Transition */}
          <motion.div
            key={`${mode}-${taskTitle}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5 px-2"
          >
            <Badge variant="purple" size="md" className="bg-orbit-blue/20 text-orbit-blue border border-orbit-blue/30 font-semibold">
              {category}
            </Badge>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white max-w-xl line-clamp-2">
              {taskTitle}
            </h1>
          </motion.div>

          {/* Circular SVG Ring & Timer Counter with Outer Glow Pulse */}
          <div className="relative flex items-center justify-center my-2 w-56 h-56 sm:w-64 sm:h-64 shrink-0 group">
            {/* Outer Glowing Breathing Ring when Running */}
            {isRunning && (
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.75, 0.35] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-orbit-blue/30 blur-2xl pointer-events-none"
              />
            )}

            <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-[0_0_20px_rgba(0,102,255,0.4)]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-white/10"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-orbit-blue transition-all duration-1000 ease-linear"
                strokeWidth="5"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <motion.div
                key={displayTime}
                initial={{ scale: 0.98, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 drop-shadow-md"
              >
                {displayTime}
              </motion.div>
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-1 flex items-center gap-1.5">
                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-orbit-orange animate-ping" />}
                {mode === 'stopwatch' ? 'ELAPSED' : `${progressPercent}% COMPLETED`}
              </span>
            </div>
          </div>

          {/* Action Control Buttons using standard Button UI Primitive */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 w-full flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="w-12 h-12 p-0 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
              title="Reset Timer (R)"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <Button
              size="lg"
              onClick={togglePlayPause}
              className={`px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 sm:gap-3 shadow-md min-w-[150px] sm:min-w-[180px] transition-all duration-300 ${
                isRunning
                  ? 'bg-orbit-orange hover:bg-orbit-orange-hover text-white shadow-orbit-orange/30'
                  : 'bg-orbit-blue hover:bg-orbit-blue-hover text-white shadow-orbit-blue/30 hover:scale-105'
              }`}
              title="Play/Pause (Space)"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </Button>

            {onCompleteTask && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  synth.stopAmbient();
                  if (soundEnabled) synth.playChime('complete');
                  onCompleteTask();
                  onClose();
                }}
                className="w-12 h-12 p-0 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30"
                title="Mark Task Complete"
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            )}
          </div>

          {/* Shortcut Keys Indicator */}
          <div className="hidden sm:flex text-[11px] text-gray-400 items-center justify-center gap-3 font-mono pt-1">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200">Space</kbd> Start/Pause</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200">R</kbd> Reset</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200">Esc</kbd> Exit</span>
          </div>
        </div>

        {/* Footer Distraction Shield Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-gray-400 z-10 pt-2">
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          <span>Distraction Shield Active — Single task focus mode</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
