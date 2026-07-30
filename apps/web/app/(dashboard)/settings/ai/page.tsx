'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Save,
  MessageSquare,
  Volume2,
  Eye,
  CheckCircle2,
  RefreshCw,
  Globe,
  Smile,
  Sliders,
  Clock,
  ShoppingBag,
  Wand2,
  Zap,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AIConfig {
  aiName: string;
  welcomeMessage: string;
  tone: 'FRIENDLY' | 'PROFESSIONAL' | 'PLAYFUL' | 'DIRECT';
  defaultLanguage: 'AUTO' | 'SINHALA' | 'SINGLISH' | 'ENGLISH';
  emojiLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  customInstructions: string;
  autoReplyEnabled: boolean;
  voiceEnabled: boolean;
  visionEnabled: boolean;
  autoOrderEnabled: boolean;
  autoResumeHours: number;
}

const welcomePresets = [
  {
    label: '🇱🇰 Sinhala Welcome',
    text: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද?',
  },
  {
    label: '🔤 Singlish Casual',
    text: 'Ayubowan! Welcome to Demo Fashion Store. Mama Maya. Oyata t-shirts ganna hari orders danna hari mama help karannada? 😊',
  },
  {
    label: '🇬🇧 English Retail',
    text: 'Hello! Welcome to Demo Fashion Store. I am Maya, your 24/7 AI shopping assistant. How can I help you with our collection today?',
  },
  {
    label: '🌐 Trilingual Auto',
    text: 'ආයුබෝවන් / Hello! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. I am Maya. Ask me about sizes, prices, or placing your order!',
  },
];

export default function AISettingsPage() {
  const [config, setConfig] = useState<AIConfig>({
    aiName: 'Maya',
    welcomeMessage: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද?',
    tone: 'FRIENDLY',
    defaultLanguage: 'AUTO',
    emojiLevel: 'MEDIUM',
    customInstructions: 'Be polite, helpful, and support Sinhala, Singlish, and English naturally.',
    autoReplyEnabled: true,
    voiceEnabled: true,
    visionEnabled: true,
    autoOrderEnabled: true,
    autoResumeHours: 2,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      // Simulate/call API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Compute live preview response text
  const getPreviewText = () => {
    const emojis =
      config.emojiLevel === 'HIGH'
        ? '🛍️✨😊'
        : config.emojiLevel === 'MEDIUM'
        ? '😊'
        : config.emojiLevel === 'LOW'
        ? '👍'
        : '';
    const name = config.aiName || 'Maya';

    if (config.tone === 'PROFESSIONAL') {
      return `Good day. I am ${name}, automated sales assistant. Black Oversized T-Shirt (XL) is available in stock at Rs. 4,500. Would you like to place an order?`;
    }
    if (config.tone === 'PLAYFUL') {
      return `Hey there! 🎉 Yes super news! ${name} checked the store for you. Black Oversized T-Shirt XL is ready to ship for Rs. 4,500 ${emojis} Want me to grab one for you?`;
    }
    if (config.tone === 'DIRECT') {
      return `Black Oversized T-Shirt (XL): Available. Price: Rs. 4,500. Reply "Order" to proceed.`;
    }
    // FRIENDLY (default)
    return `ඔව් ${emojis} Black Oversized T-Shirt එකේ XL size available.\n\nPrice: Rs. 4,500\nAvailable Stock: 10 items remaining.\n\nOrder කරන්නද? ("Order කරන්න" කියලා message එකක් එවන්න!)`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Google Gemini AI Engine Active
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" /> AI Assistant Configurator & Persona
          </h1>
          <p className="text-xs text-slate-400">
            Tune Maya's brand identity, trilingual preferences, welcome messages, and automated store workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold animate-in fade-in">
              <Check className="h-4 w-4" /> Settings Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: CONFIGURATION FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: IDENTITY & PERSONA */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Smile className="h-4 w-4 text-emerald-400" /> Identity & Conversational Persona
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AI Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">AI Assistant Name</label>
                <input
                  type="text"
                  value={config.aiName}
                  onChange={(e) => setConfig({ ...config, aiName: e.target.value })}
                  placeholder="e.g., Maya, Nimali, Alex"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-slate-500">How your assistant introduces itself in WhatsApp chats</p>
              </div>

              {/* Default Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Primary Language Mode</label>
                <select
                  value={config.defaultLanguage}
                  onChange={(e: any) => setConfig({ ...config, defaultLanguage: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="AUTO">AUTO (Trilingual Sinhala / Singlish / English)</option>
                  <option value="SINHALA">Sinhala Only (සිංහල)</option>
                  <option value="SINGLISH">Singlish Only (Sinhala in Latin Script)</option>
                  <option value="ENGLISH">English Only</option>
                </select>
                <p className="text-[10px] text-slate-500">Auto detects customer language from initial message</p>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Conversation Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'FRIENDLY', label: 'Friendly & Warm', desc: 'Welcoming, uses emojis, polite' },
                  { key: 'PROFESSIONAL', label: 'Professional', desc: 'Formal retail, structured' },
                  { key: 'PLAYFUL', label: 'Playful & Upbeat', desc: 'High energy, trendy streetwear vibe' },
                  { key: 'DIRECT', label: 'Direct & Concise', desc: 'Short answers, quick stock check' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setConfig({ ...config, tone: t.key as any })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.tone === t.key
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{t.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Emoji Usage Level</label>
              <div className="flex items-center gap-2">
                {[
                  { key: 'NONE', label: 'None (0%)' },
                  { key: 'LOW', label: 'Low (Sparse 👍)' },
                  { key: 'MEDIUM', label: 'Medium (Balanced 😊)' },
                  { key: 'HIGH', label: 'High (Expressive 🛍️✨)' },
                ].map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    onClick={() => setConfig({ ...config, emojiLevel: e.key as any })}
                    className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                      config.emojiLevel === e.key
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: WELCOME MESSAGE & CUSTOM INSTRUCTIONS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <MessageSquare className="h-4 w-4 text-emerald-400" /> Welcome Message & System Prompts
            </h3>

            {/* Welcome Message Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Automated Welcome Message</label>
                <span className="text-[10px] text-slate-400">Click preset to apply:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {welcomePresets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setConfig({ ...config, welcomeMessage: p.text })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Custom Business Instructions (System Prompt)</label>
              <textarea
                rows={4}
                value={config.customInstructions}
                onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                placeholder="e.g., Always mention islandwide COD Rs. 350. Promote 10% discount for bank transfer. Offer 7 days exchange policy."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono"
              />
              <p className="text-[10px] text-slate-500">
                These instructions guide Gemini's tool calls and policy responses for your specific business.
              </p>
            </div>
          </div>

          {/* SECTION 3: AUTOMATION WORKFLOW SWITCHES */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Zap className="h-4 w-4 text-emerald-400" /> Automation Workflows & Feature Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: 'autoReplyEnabled',
                  label: 'Auto-Reply Engine',
                  desc: 'Automatically reply to customer WhatsApp messages 24/7',
                },
                {
                  key: 'autoOrderEnabled',
                  label: 'Automated Order Creation',
                  desc: 'Allow AI to create COD orders directly in database',
                },
                {
                  key: 'voiceEnabled',
                  label: 'Voice Note AI Processing',
                  desc: 'Transcribe and process Sinhala/English voice notes',
                },
                {
                  key: 'visionEnabled',
                  label: 'Vision AI Image Search',
                  desc: 'Identify products from customer uploaded photos',
                },
              ].map(({ key, label, desc }) => {
                const val = (config as any)[key];
                return (
                  <div key={key} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, [key]: !val })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        val ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          val ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Auto Resume Timer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Human Takeover Auto-Resume Timer</p>
                <p className="text-[10px] text-slate-400">
                  Automatically switch conversation back to AI after agent inactivity
                </p>
              </div>
              <select
                value={config.autoResumeHours}
                onChange={(e) => setConfig({ ...config, autoResumeHours: parseInt(e.target.value, 10) })}
                className="rounded-xl bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-white focus:outline-none"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours (Default)</option>
                <option value={4}>4 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE WHATSAPP CHAT PREVIEW */}
        <div className="space-y-4">
          <div className="sticky top-20 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" /> Live Response Preview
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {config.tone}
              </span>
            </div>

            {/* Simulated WhatsApp Phone Frame */}
            <div className="rounded-2xl bg-[#0b141a] border border-slate-800 overflow-hidden shadow-xl">
              {/* WhatsApp Header */}
              <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-slate-800">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-400">
                  {config.aiName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{config.aiName} (AI Assistant)</p>
                  <p className="text-[10px] text-emerald-400">Online • Trilingual Mode</p>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="p-4 space-y-3 min-h-[260px] bg-gradient-to-b from-[#0b141a] to-[#0d1b22]">
                {/* User Bubble */}
                <div className="flex flex-col items-end">
                  <div className="max-w-[80%] rounded-xl rounded-tr-none bg-[#005c4b] px-3 py-2 text-xs text-white shadow">
                    <p>black tshirt XL තියෙනවද?</p>
                    <span className="block text-[9px] text-emerald-200 text-right mt-1">10:02 AM</span>
                  </div>
                </div>

                {/* AI Reply Bubble */}
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] rounded-xl rounded-tl-none bg-[#202c33] border border-slate-700/60 px-3 py-2.5 text-xs text-slate-100 shadow space-y-1">
                    <span className="block text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {config.aiName}:
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{getPreviewText()}</p>
                    <span className="block text-[9px] text-slate-400 text-right mt-1">10:02 AM • 0.9s</span>
                  </div>
                </div>
              </div>

              {/* Footer status */}
              <div className="bg-[#1f2c34] p-2 text-center text-[10px] text-slate-400 border-t border-slate-800">
                ⚡ Powered by Google Gemini 2.5 Flash
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> How Persona Works
              </p>
              <p className="text-[11px] text-indigo-200 leading-relaxed">
                Changes to assistant name, tone, and emoji rules take effect immediately across all active customer WhatsApp conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
