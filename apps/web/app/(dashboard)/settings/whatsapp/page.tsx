'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Key,
  Hash,
  Shield,
  Globe,
  Zap,
  ChevronRight,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function WhatsAppSettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken] = useState('wh_verify_secret_123');
  const [webhookUrl] = useState('https://YOUR-NGROK-URL.ngrok-free.app/messaging/webhook');
  const [ngrokUrl, setNgrokUrl] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState<string | null>(null);

  const dynamicWebhookUrl = ngrokUrl
    ? `${ngrokUrl.replace(/\/$/, '')}/messaging/webhook`
    : 'https://YOUR-NGROK-URL.ngrok-free.app/messaging/webhook';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const testWebhook = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch('http://localhost:4000/messaging/webhook?hub.mode=subscribe&hub.verify_token=wh_verify_secret_123&hub.challenge=TEST_CHALLENGE_123');
      if (res.ok) setTestStatus('ok');
      else setTestStatus('error');
    } catch {
      setTestStatus('error');
    }
  };

  const saveCredentials = async () => {
    if (!phoneNumberId || !accessToken) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('http://localhost:4000/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, accessToken }),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-emerald-400" />
          WhatsApp Business Connection
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect your Meta WhatsApp Business Account to receive and reply to real customer messages.
        </p>
      </div>

      {/* Step 1: Expose local server */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">1</span>
          <h2 className="text-sm font-bold text-white">Expose your local server with ngrok</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Meta needs a public HTTPS URL to send webhook events to. Run ngrok to create a tunnel to your local API server (port 4000).
          </p>
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-300 border border-slate-800">
            <p className="text-slate-500 mb-1"># In a new terminal window:</p>
            <p>ngrok http 4000</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Your ngrok URL (paste from terminal output):</label>
            <input
              type="text"
              value={ngrokUrl}
              onChange={(e) => setNgrokUrl(e.target.value)}
              placeholder="https://abc123.ngrok-free.app"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          {ngrokUrl && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-300 font-mono flex-1 truncate">{dynamicWebhookUrl}</span>
              <button
                onClick={() => copyToClipboard(dynamicWebhookUrl, 'webhook')}
                className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400"
              >
                {copied === 'webhook' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Meta Developer App */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">2</span>
          <h2 className="text-sm font-bold text-white">Create a Meta Developer App</h2>
          <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
            Open Meta Dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="p-5 space-y-3">
          {[
            'Go to developers.facebook.com → My Apps → Create App',
            'Choose "Business" as app type → Give it a name → Create App',
            'In the dashboard, click "Add Product" → find "WhatsApp" → click "Set Up"',
            'Under WhatsApp → Configuration, set up your Webhook (next step)',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <ChevronRight className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Configure Webhook */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold">3</span>
          <h2 className="text-sm font-bold text-white">Configure Webhook in Meta Dashboard</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            In WhatsApp → Configuration → Webhook, click <strong className="text-white">Edit</strong> and enter:
          </p>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Globe className="h-3 w-3" /> Callback URL
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-emerald-300 flex-1 truncate">{dynamicWebhookUrl}</span>
              <button onClick={() => copyToClipboard(dynamicWebhookUrl, 'cb')} className="p-1 rounded text-slate-400 hover:text-white">
                {copied === 'cb' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Verify Token */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Verify Token
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-amber-300 flex-1">{verifyToken}</span>
              <button onClick={() => copyToClipboard(verifyToken, 'vt')} className="p-1 rounded text-slate-400 hover:text-white">
                {copied === 'vt' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>After saving, click <strong>Manage</strong> under Webhook fields and subscribe to the <strong className="text-white">messages</strong> field.</span>
          </div>

          {/* Test webhook button */}
          <button
            onClick={testWebhook}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-500/30 disabled:opacity-50"
          >
            {testStatus === 'testing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : testStatus === 'ok' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : testStatus === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {testStatus === 'idle' && 'Test Webhook Endpoint'}
            {testStatus === 'testing' && 'Testing...'}
            {testStatus === 'ok' && '✅ Webhook is reachable!'}
            {testStatus === 'error' && '❌ Webhook unreachable — start ngrok first'}
          </button>
        </div>
      </div>

      {/* Step 4: Enter Credentials */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">4</span>
          <h2 className="text-sm font-bold text-white">Enter your Meta credentials</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            In Meta Dashboard → WhatsApp → API Setup, copy your <strong className="text-white">Phone Number ID</strong> and generate a <strong className="text-white">Permanent Access Token</strong>.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Hash className="h-3 w-3" /> Phone Number ID
            </label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g. 102938475610293"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Key className="h-3 w-3" /> Permanent Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAABsbCS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 font-mono"
            />
            <p className="text-[10px] text-slate-500">
              Generate a permanent token: Meta Dashboard → System Users → Generate Token (with whatsapp_business_messaging permission)
            </p>
          </div>

          <button
            onClick={saveCredentials}
            disabled={!phoneNumberId || !accessToken || saveStatus === 'saving'}
            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : saveStatus === 'error'
                ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40'
            }`}
          >
            {saveStatus === 'saving' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle2 className="h-4 w-4" />}
            {saveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            {saveStatus === 'idle' && 'Save & Activate WhatsApp Connection'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'WhatsApp Connected Successfully!'}
            {saveStatus === 'error' && 'Failed — Check API is running'}
          </button>
        </div>
      </div>

      {/* Step 5: Done */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">5</span>
          <h2 className="text-sm font-bold text-white">Test with a real WhatsApp message</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            'In Meta Dashboard → WhatsApp → API Setup, scroll to "Send and Receive Messages"',
            'Add your personal WhatsApp number as a test recipient',
            'Send a message to your WABA number from your personal WhatsApp',
            'Maya (Gemini AI) will reply automatically within seconds!',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{step}</span>
            </div>
          ))}

          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-300 font-semibold mb-1">📍 Your Webhook URL for Meta Dashboard:</p>
            <p className="text-xs font-mono text-emerald-400">{dynamicWebhookUrl}</p>
            <p className="text-xs font-mono text-amber-300 mt-1">Verify Token: {verifyToken}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
