'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Bot,
  Zap,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  const dailyVolume = [
    { day: 'Jul 8', ai: 420, human: 18, orders: 12 },
    { day: 'Jul 9', ai: 510, human: 22, orders: 15 },
    { day: 'Jul 10', ai: 480, human: 14, orders: 18 },
    { day: 'Jul 11', ai: 620, human: 31, orders: 24 },
    { day: 'Jul 12', ai: 710, human: 25, orders: 28 },
    { day: 'Jul 13', ai: 690, human: 19, orders: 22 },
    { day: 'Jul 14', ai: 840, human: 28, orders: 34 },
    { day: 'Jul 15', ai: 920, human: 35, orders: 41 },
    { day: 'Jul 16', ai: 880, human: 20, orders: 36 },
    { day: 'Jul 17', ai: 1050, human: 42, orders: 48 },
    { day: 'Jul 18', ai: 1120, human: 38, orders: 52 },
    { day: 'Jul 19', ai: 980, human: 26, orders: 44 },
    { day: 'Jul 20', ai: 1240, human: 45, orders: 61 },
    { day: 'Jul 21', ai: 1310, human: 39, orders: 67 },
  ];

  const topProducts = [
    { rank: 1, name: 'Black Oversized T-Shirt', searches: 1420, orders: 184, revenue: 'Rs. 828,000', conversion: '12.9%', stock: 'In Stock (42)' },
    { rank: 2, name: 'White Essential Tee', searches: 980, orders: 112, revenue: 'Rs. 425,600', conversion: '11.4%', stock: 'In Stock (18)' },
    { rank: 3, name: 'Vintage Denim Jacket', searches: 740, orders: 48, revenue: 'Rs. 408,000', conversion: '6.4%', stock: 'Low Stock (4)' },
    { rank: 4, name: 'Beige Cargo Pants', searches: 610, orders: 62, revenue: 'Rs. 322,400', conversion: '10.1%', stock: 'In Stock (29)' },
    { rank: 5, name: 'Linen Summer Shirt', searches: 490, orders: 38, revenue: 'Rs. 182,400', conversion: '7.7%', stock: 'In Stock (15)' },
  ];

  const maxVolume = Math.max(...dailyVolume.map((d) => d.ai));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" /> Sales & AI Performance Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time conversion funnel, AI resolution rates, peak traffic hours, and revenue attribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeRange === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">AI Generated Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">Rs. 2,166,400</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" /> +24.8% vs last month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">AI Resolution Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">94.2%</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" /> 5.8% human handover rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Avg Response Speed</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">1.1 sec</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="h-3.5 w-3.5 text-teal-400" /> Instant Gemini 2.5 Flash
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Conversion Funnel</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400">19.5%</p>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
            <Percent className="h-3.5 w-3.5" /> 444 Orders from 2,280 inquiries
          </div>
        </div>
      </div>

      {/* CONVERSATION VOLUME CHART + FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Daily Conversation Volume (14 Days)
              </h3>
              <p className="text-[11px] text-slate-400">Comparing automated AI responses vs human agent handovers</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-300">AI Handled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
                <span className="text-slate-300">Human Handover</span>
              </div>
            </div>
          </div>

          {/* Chart Bars */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-slate-800">
            {dailyVolume.map((item) => {
              const heightPct = Math.round((item.ai / maxVolume) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-[10px] z-20 whitespace-nowrap shadow-xl">
                    <span className="font-bold text-white">{item.day}</span>
                    <span className="text-emerald-400">{item.ai} AI • {item.orders} Orders</span>
                  </div>
                  {/* Bar */}
                  <div className="w-full bg-slate-950 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-emerald-500 group-hover:bg-emerald-400 transition-all rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">{item.day.split(' ')[1]}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Total Messages Handled: <strong className="text-white">12,260</strong></span>
            <span>Total COD Orders Created: <strong className="text-emerald-400">444 orders</strong></span>
          </div>
        </div>

        {/* Conversion Funnel Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Conversion Funnel Status
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Total Inbound Chats', count: 2280, pct: 100, color: 'bg-indigo-500' },
              { label: 'Product Stock Searches', count: 1840, pct: 80.7, color: 'bg-blue-500' },
              { label: 'Cart / Checkout Initiated', count: 680, pct: 29.8, color: 'bg-teal-500' },
              { label: 'COD Orders Completed', count: 444, pct: 19.5, color: 'bg-emerald-500' },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{step.label}</span>
                  <span className="font-bold text-white">
                    {step.count.toLocaleString()} <span className="text-slate-500 text-[10px]">({step.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div className={`${step.color} h-full rounded-full`} style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Token Efficiency</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Avg Cost per Order:</span>
              <span className="font-bold text-emerald-400">$0.0042 (Rs. 1.26)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Estimated ROI:</span>
              <span className="font-bold text-purple-400">3,450% Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP REQUESTED PRODUCTS TABLE */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-400" /> Top AI Requested Products & Revenue Attribution
          </h3>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Ranked by AI Stock Searches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank & Product</th>
                <th className="py-3 px-4">AI Searches</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Conversion %</th>
                <th className="py-3 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {topProducts.map((p) => (
                <tr key={p.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-emerald-400">
                        #{p.rank}
                      </span>
                      <span className="font-semibold text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{p.searches.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-white font-bold">{p.orders}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">{p.revenue}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                      {p.conversion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold ${
                        p.stock.includes('Low') ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
