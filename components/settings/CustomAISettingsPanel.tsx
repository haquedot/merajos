'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAIConfigStore } from '../../store/useAIConfigStore';
import { UserAIModelConfig } from '../../lib/agent/types';
import { maskKeyDisplay } from '../../lib/security/keyCrypto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/select';

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI (e.g. gpt-4o, gpt-4o-mini)', defaultModel: 'gpt-4o' },
  { value: 'anthropic', label: 'Anthropic (e.g. claude-3-5-sonnet)', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'gemini', label: 'Google Gemini (e.g. gemini-1.5-pro, gemini-1.5-flash)', defaultModel: 'gemini-1.5-flash' },
  { value: 'groq', label: 'Groq Cloud (e.g. llama-3.3-70b-versatile)', defaultModel: 'llama-3.3-70b-versatile' },
  { value: 'ollama', label: 'Ollama (Local / Custom Base URL)', defaultModel: 'llama3:latest' },
];

export const CustomAISettingsPanel: React.FC = () => {
  const { configs, activeModelId, addModelConfig, deleteModelConfig, setActiveModelId } = useAIConfigStore();

  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [providerId, setProviderId] = useState<'openai' | 'anthropic' | 'gemini' | 'groq' | 'ollama'>('openai');
  const [name, setName] = useState('');
  const [modelName, setModelName] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; msg?: string } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs animate-pulse space-y-4 min-h-[140px]" />
    );
  }

  const handleProviderChange = (newProv: string) => {
    const p = newProv as any;
    setProviderId(p);
    const matched = PROVIDER_OPTIONS.find((opt) => opt.value === p);
    if (matched) {
      setModelName(matched.defaultModel);
      if (!name) {
        setName(`My ${matched.label.split(' ')[0]} Model`);
      }
    }
  };

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (providerId !== 'ollama' && !apiKey.trim()) return;

    addModelConfig({
      providerId,
      name: name.trim() || `${providerId.toUpperCase()} - ${modelName}`,
      modelName: modelName.trim() || 'default',
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
      isActive: configs.length === 0,
    });

    // Reset form
    setName('');
    setApiKey('');
    setBaseUrl('');
    setIsAddModalOpen(false);
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await fetch('/api/agent/co-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Hello! Respond with "OK"',
          providerId,
          userConfig: {
            providerId,
            modelName,
            apiKey: apiKey.trim(),
            baseUrl: baseUrl.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTestStatus({ loading: false, success: true, msg: 'API Key & Model Verified Successfully!' });
    } catch (err: any) {
      setTestStatus({ loading: false, success: false, msg: err.message || 'Connection failed' });
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>AI Co-Pilot & Provider Keys</span>
              <Badge variant="purple" size="sm">BYOK</Badge>
            </h2>
            <p className="text-xs text-gray-500">
              Supply your own OpenAI, Anthropic, Gemini, Groq, or Ollama keys securely
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom AI Key</span>
        </Button>
      </div>

      {/* Security Banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold text-slate-800 dark:text-slate-200">100% Client-Side Obfuscated & End-to-End Encrypted</p>
          <p className="text-[11px] leading-relaxed">
            Your API keys are encrypted in browser local storage and sent via HTTPS exclusively to fulfill your prompt execution. They are never saved to our database logs.
          </p>
        </div>
      </div>

      {/* Configured Models List */}
      {configs.length === 0 ? (
        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2">
          <Zap className="w-8 h-8 text-sky-400 mx-auto opacity-70" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No Custom AI Keys Added Yet</p>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
            Add your OpenAI, Anthropic, Gemini, or Groq API keys above. Only the models you configure will appear in your Co-Pilot drawer dropdown!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {configs.map((cfg) => {
            const isActive = cfg.id === activeModelId;
            return (
              <div
                key={cfg.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isActive
                    ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800/80 shadow-xs'
                    : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/70 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setActiveModelId(cfg.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'border-sky-500 bg-sky-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    title={isActive ? 'Active Model' : 'Set as Active Default Model'}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                  </button>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                        {cfg.name}
                      </span>
                      <Badge variant="outline" size="sm" className="uppercase text-[9px]">
                        {cfg.providerId}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {cfg.modelName}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono">
                      Key: {maskKeyDisplay(cfg.apiKey)} {cfg.baseUrl ? `• URL: ${cfg.baseUrl}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isActive ? (
                    <Badge variant="success" size="sm" className="gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Active Default
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveModelId(cfg.id)}
                      className="text-[10px] h-7 px-2.5"
                    >
                      Make Default
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteModelConfig(cfg.id)}
                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete custom model key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Key Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Custom User AI Key & Model">
        <form onSubmit={handleSaveModel} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              AI Provider Platform *
            </label>
            <Select
              value={providerId}
              onValueChange={handleProviderChange}
              options={PROVIDER_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Configuration Label Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Personal GPT-4o Key"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              API Model Identifier Name *
            </label>
            <Input
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022, gemini-1.5-pro, llama-3.3-70b-versatile"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Type the exact model ID string recognized by your provider's API.
            </p>
          </div>

          {providerId !== 'ollama' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Secret API Key *
              </label>
              <div className="relative">
                <Input
                  required
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {(providerId === 'ollama' || providerId === 'openai') && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Custom Endpoint Base URL {providerId === 'ollama' ? '*' : '(Optional Proxy)'}
              </label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={providerId === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
              />
            </div>
          )}

          {/* Test Status Banner */}
          {testStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                testStatus.loading
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : testStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testStatus.loading ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="truncate">{testStatus.loading ? 'Testing API key connection...' : testStatus.msg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testStatus?.loading || (providerId !== 'ollama' && !apiKey.trim())}
              className="text-xs font-bold"
            >
              Test Connection
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Model Config
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
