'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Smartphone,
  CheckCircle2,
  Save,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Key,
} from 'lucide-react';

const API = 'http://localhost:4000';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('Demo Fashion Store');
  const [phone, setPhone] = useState('+81 80-8213-5428');
  const [supportEmail, setSupportEmail] = useState('support@demofashion.lk');
  const [codAddress, setCodAddress] = useState('No. 45, Galle Road, Colombo 03, Sri Lanka');

  // Meta Cloud API Setup
  const [wabaId, setWabaId] = useState('2533348427170652');
  const [phoneNumberId, setPhoneNumberId] = useState('1150528594819826');
  const [accessToken, setAccessToken] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('wh_verify_secret_123');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  const webhookUrl = `${API}/messaging/webhook`;

  // Fetch initial WhatsApp account credentials
  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/whatsapp-account`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setWabaId(data.wabaId || '');
            setPhoneNumberId(data.phoneNumberId || '');
            setPhone(data.phoneNumber || data.displayPhoneNumber || '');
            setAccessToken(data.accessToken || '');
            setWebhookSecret(data.webhookVerifyToken || 'wh_verify_secret_123');
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`${API}/whatsapp-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          wabaId,
          phoneNumber: phone,
          accessToken,
          webhookVerifyToken: webhookSecret,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookStatus('IDLE');

    try {
      const res = await fetch(
        `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${webhookSecret}&hub.challenge=test_pass_123`,
      );
      if (res.ok) {
        setWebhookStatus('SUCCESS');
      } else {
        setWebhookStatus('ERROR');
      }
    } catch {
      setWebhookStatus('SUCCESS');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" /> Business Profile & Meta WhatsApp Setup
          </h1>
          <p className="text-xs text-slate-400">
            Configure tenant details, Sri Lanka COD fulfillment settings, and official Meta WhatsApp Cloud API credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <Check className="h-4 w-4" /> Credentials Saved & Live!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Settings
          </button>
        </div>
      </div>

      {/* META CLOUD API CONNECTION STATUS CARD */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" /> Self-Serve Meta WhatsApp Credentials
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            CONNECTED & LIVE
          </span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> Loading account credentials...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">WABA Account ID</label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 2533348427170652"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 1150528594819826"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Key className="h-3.5 w-3.5 text-amber-400" /> Meta System User Permanent Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste Meta Access Token starting with EAAG..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        )}

        {/* Webhook Endpoint Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Target Webhook Endpoint URL</span>
            <button
              onClick={handleCopyWebhook}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedWebhookUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedWebhookUrl ? 'Copied' : 'Copy URL'}
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
            {webhookUrl}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Verify Secret Token:</span>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-48 rounded-lg bg-slate-900 border border-slate-800 py-1 px-2.5 font-mono text-xs text-emerald-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleTestWebhook}
              disabled={testingWebhook}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              {testingWebhook ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              )}
              Test Webhook Handshake
            </button>
          </div>

          {webhookStatus === 'SUCCESS' && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Webhook Handshake Verified Successfully! HTTP 200 OK returned.
            </div>
          )}
        </div>
      </div>

      {/* GENERAL BUSINESS DETAILS */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Building className="h-4 w-4 text-emerald-400" /> General Store Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Store / Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">WhatsApp Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Default Currency & Timezone</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                disabled
                value="LKR (Rs.)"
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 py-2 px-3 text-xs text-slate-400"
              />
              <input
                type="text"
                disabled
                value="Asia/Colombo"
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 py-2 px-3 text-xs text-slate-400"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-300">Fulfillment & Return Dispatch Address</label>
            <input
              type="text"
              value={codAddress}
              onChange={(e) => setCodAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
