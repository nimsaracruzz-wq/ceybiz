'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Overview</h1>
          <p className="text-sm text-slate-400">Real-time performance of your 24/7 WhatsApp AI Sales Assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/simulator"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <Smartphone className="h-4 w-4" />
            Open WhatsApp Simulator
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversations Today</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">128</span>
            <span className="flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +14%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">112 automated by AI • 16 human handovers</p>
        </div>

        {/* STAT 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Replies</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">3,842</span>
            <span className="text-xs text-slate-400">76.8% of plan quota</span>
          </div>
          <p className="text-[11px] text-slate-400">Avg response time: 1.2s</p>
        </div>

        {/* STAT 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders Generated</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">24</span>
            <span className="flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +28%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Rs. 108,000 revenue today</p>
        </div>

        {/* STAT 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Resolution Rate</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">87.5%</span>
            <span className="text-xs text-emerald-400 font-semibold">High accuracy</span>
          </div>
          <p className="text-[11px] text-slate-400">12.5% escalated to human support</p>
        </div>
      </div>

      {/* QUOTA WARNING & SIMULATOR CTA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QUOTA METER WIDGET */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-400" />
              Monthly AI Quota Meter
            </h3>
            <span className="text-xs text-slate-400 font-medium">PRO Plan</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">AI Replies Used</span>
              <span className="text-white font-semibold">3,842 / 5,000</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full w-[76.8%]" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              You are approaching 80% of your monthly AI quota. Auto-topup or upgrade to MAX plan for uninterrupted service.
            </p>
          </div>
        </div>

        {/* SIMULATOR BANNER CTA */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900/80 to-emerald-950/40 border border-indigo-500/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Trilingual AI Engine Ready
            </div>
            <h3 className="text-lg font-bold text-white">Test Sinhala & Singlish WhatsApp AI Assistant</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Simulate customer queries like <span className="text-emerald-300 font-mono">"black tshirt XL තියෙනවද?"</span> or voice notes and verify real DB stock search, order creation, and quota deduction.
            </p>
          </div>
          <Link
            href="/simulator"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
          >
            Launch Simulator
          </Link>
        </div>
      </div>

      {/* RECENT CONVERSATIONS & ORDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT CONVERSATIONS */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent WhatsApp Inbox Activity</h3>
            <Link href="/inbox" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              View Inbox <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  NP
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Nimal Perera (+94 77 987 6543)</p>
                  <p className="text-xs text-slate-400 truncate max-w-xs">"black tshirt XL තියෙනවද?"</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  AI Mode
                </span>
                <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
                  SK
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Sunil K. (+94 71 456 7890)</p>
                  <p className="text-xs text-slate-400 truncate max-w-xs">"Sunday open ද store එක?"</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  AI Mode
                </span>
                <p className="text-[10px] text-slate-400 mt-1">15 mins ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Latest AI-Generated Orders</h3>
            <Link href="/orders" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              View Kanban Board <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">#ORD-8821</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                    NEW
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">Black Oversized T-Shirt (XL) x 1</p>
                <p className="text-[10px] text-slate-400">Nimal Perera • COD</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">Rs. 4,850</p>
                <p className="text-[10px] text-slate-400 mt-1">Via WhatsApp AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
