'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Bot,
  Zap,
  Shield,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Check,
  Plus,
  Flame,
} from 'lucide-react';

const API = 'http://localhost:4000';

interface Plan {
  id: string;
  name: 'TRIAL' | 'PRO' | 'MAX';
  displayName: string;
  description: string;
  priceMonthly: number;
  aiRepliesQuota: number;
  whatsAppAccounts: number;
  productLimit: number;
  voiceAiAllowed: boolean;
  visionAiAllowed: boolean;
  campaignsAllowed: boolean;
  advancedAnalytics: boolean;
}

interface SubDetails {
  subscription: {
    status: string;
    currentPeriodEnd: string;
  };
  plan: Plan;
  usage: {
    aiRepliesUsed: number;
    aiRepliesQuota: number;
    extraQuota: number;
    totalAllowed: number;
    percentUsed: number;
  };
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subDetails, setSubDetails] = useState<SubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [toppingUp, setToppingUp] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API}/entitlements/plans`),
        fetch(`${API}/entitlements/subscription`),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubDetails(subData);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleSubscribe = async (tier: 'TRIAL' | 'PRO' | 'MAX') => {
    setUpgradingTier(tier);
    try {
      const res = await fetch(`${API}/entitlements/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier }),
      });
      if (res.ok) {
        setActionSuccess(`Successfully switched to ${tier} Package Plan!`);
        setTimeout(() => setActionSuccess(null), 4000);
        await fetchSubscriptionData();
      }
    } catch {
      // silent
    } finally {
      setUpgradingTier(null);
    }
  };

  const handleTopUp = async (replyQuota: number, pricePaid: number) => {
    setToppingUp(replyQuota);
    try {
      const res = await fetch(`${API}/entitlements/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyQuota, pricePaid }),
      });
      if (res.ok) {
        setActionSuccess(`+${replyQuota.toLocaleString()} AI Replies Top-Up Added!`);
        setTimeout(() => setActionSuccess(null), 4000);
        await fetchSubscriptionData();
      }
    } catch {
      // silent
    } finally {
      setToppingUp(null);
    }
  };

  const currentTier = subDetails?.plan?.name || 'PRO';

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-400" /> Subscription & Usage Entitlements
          </h1>
          <p className="text-xs text-slate-400">
            Select your business package, monitor monthly AI reply quotas, and add instant reply top-ups
          </p>
        </div>
        {actionSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <Check className="h-4 w-4" /> {actionSuccess}
          </div>
        )}
      </div>

      {/* CURRENT PLAN & LIVE METERS GRID */}
      {subDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ACTIVE TIER CARD */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-400">Active Package Plan</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                {subDetails.plan.displayName.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-white">
                ${subDetails.plan.priceMonthly}{' '}
                <span className="text-xs text-slate-400 font-normal">/ month</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Renews on{' '}
                {new Date(subDetails.subscription.currentPeriodEnd || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{subDetails.plan.aiRepliesQuota.toLocaleString()} Monthly AI Replies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sinhala/English Multimodal Voice AI</span>
              </div>
            </div>
          </div>

          {/* QUOTA METER: AI REPLIES */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-400" /> AI Replies Quota
              </h4>
              <span className="text-xs font-bold text-amber-400">{subDetails.usage.percentUsed}% Used</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Used</span>
                <span>
                  {subDetails.usage.aiRepliesUsed.toLocaleString()} / {subDetails.usage.totalAllowed.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, subDetails.usage.percentUsed)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Base Plan: {subDetails.usage.aiRepliesQuota.toLocaleString()}</span>
                <span>Top-Ups: +{subDetails.usage.extraQuota.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* INSTANT TOP-UP ACTIONS */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl backdrop-blur-sm">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400" /> Top-Up Extra Replies
            </h4>
            <p className="text-xs text-slate-400">Add instant reply capacity to your account without changing your monthly tier.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTopUp(1000, 10)}
                disabled={toppingUp !== null}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
              >
                {toppingUp === 1000 ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-emerald-400" />}
                +1,000 ($10)
              </button>
              <button
                onClick={() => handleTopUp(5000, 35)}
                disabled={toppingUp !== null}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
              >
                {toppingUp === 5000 ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-emerald-400" />}
                +5,000 ($35)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL PACKAGES / PLANS COMPARISON */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Select Business Subscription Package</h2>
          <p className="text-xs text-slate-400">Choose the package plan that best fits your business sales volume</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> Loading package plans...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentTier === plan.name;
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all ${
                    isCurrent
                      ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{plan.displayName}</h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          ACTIVE PLAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                    <div className="py-2">
                      <span className="text-3xl font-extrabold text-white">${plan.priceMonthly}</span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-200 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{plan.aiRepliesQuota.toLocaleString()} AI Replies / Month</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{plan.whatsAppAccounts} WhatsApp Business Number</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{plan.productLimit} Catalog Products</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Voice Note Recognition (Sinhala & English)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>7-Photo Rapid Album Grid Sequences</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={isCurrent || upgradingTier !== null}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {upgradingTier === plan.name ? (
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      'Current Active Plan'
                    ) : (
                      `Subscribe to ${plan.displayName}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
