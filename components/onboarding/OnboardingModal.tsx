'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '../common/Logo';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ModuleKey, OnboardingProfile, UserRole } from '../../types';
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2Role } from './steps/Step2Role';
import { Step3Modules } from './steps/Step3Modules';
import { Step4Routine } from './steps/Step4Routine';
import { Step5Done } from './steps/Step5Done';

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Welcome', 'Your Role', 'Workspace', 'Routine', 'All Set'];

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { saveOnboardingProfile } = useSettingsStore();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('custom');
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(['tasks', 'calendar']);
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [primaryGoal, setPrimaryGoal] = useState('');

  const handleRoleSelect = (selectedRole: UserRole, presetModules: ModuleKey[]) => {
    setRole(selectedRole);
    setEnabledModules(presetModules);
  };

  const handleToggleModule = (key: ModuleKey) => {
    setEnabledModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const profile: OnboardingProfile = {
      displayName: displayName.trim() || 'User',
      role,
      enabledModules,
      workStartTime,
      workEndTime,
      primaryGoal,
      onboardingCompleted: true,
    };
    await saveOnboardingProfile(profile);
    setIsSaving(false);
    onComplete();
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white dark:bg-[#101827] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col my-auto"
      >
        {/* Top bar */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone = n < step;
              return (
                <React.Fragment key={n}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : isDone
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isDone ? '✓' : n}
                    </div>
                    <span className={`hidden sm:block text-[11px] font-semibold transition-all ${isActive ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      {STEP_LABELS[i]}
                    </span>
                  </div>
                  {i < TOTAL_STEPS - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${n < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 touch-scroll">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Welcome
                displayName={displayName}
                onChange={setDisplayName}
                onNext={next}
              />
            )}
            {step === 2 && (
              <Step2Role
                selectedRole={role}
                onSelect={handleRoleSelect}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 3 && (
              <Step3Modules
                selectedModules={enabledModules}
                onToggle={handleToggleModule}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 4 && (
              <Step4Routine
                workStartTime={workStartTime}
                workEndTime={workEndTime}
                primaryGoal={primaryGoal}
                onChangeStart={setWorkStartTime}
                onChangeEnd={setWorkEndTime}
                onChangeGoal={setPrimaryGoal}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 5 && (
              <Step5Done
                displayName={displayName || 'Friend'}
                enabledModules={enabledModules}
                isSaving={isSaving}
                onFinish={handleFinish}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
