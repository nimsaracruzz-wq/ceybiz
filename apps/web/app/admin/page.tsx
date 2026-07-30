'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Activity,
  Bot,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Globe,
  Zap,
  Package,
  Eye,
  Ban,
  RefreshCw,
  BarChart3,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Database,
  Cpu,
  Bell,
} from 'lucide-react';

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'TRIAL' | 'PRO' | 'MAX';
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'SUSPENDED';
  country: string;
  aiRepliesUsed: number;
  aiRepliesQuota: number;
  mrr: number;
  ordersThisMonth: number;
  joinedAt: string;
  ownerEmail: string;
  lastActive: string;
}

const mockTenants: Tenant[] = [
  {
    id: 't1',
    name: 'Demo Fashion Store',
    slug: 'demo-fashion',
    plan: 'PRO',
    status: 'ACTIVE',
    country: 'LK',
    aiRepliesUsed: 3842,
    aiRepliesQuota: 5000,
    mrr: 49,
    ordersThisMonth: 24,
    joinedAt: 'Jun 1, 2026',
    ownerEmail: 'owner@demofashion.com',
    lastActive: '2 mins ago',
  },
  {
    id: 't2',
    name: 'Colombo Electronics Hub',
    slug: 'colombo-electronics',
    plan: 'MAX',
    status: 'ACTIVE',
    country: 'LK',
    aiRepliesUsed: 18200,
    aiRepliesQuota: 20000,
    mrr: 149,
    ordersThisMonth: 142,
    joinedAt: 'Apr 10, 2026',
    ownerEmail: 'admin@colomboelectronics.lk',
    lastActive: '8 mins ago',
  },
  {
    id: 't3',
    name: 'Kandy Spice Garden',
    slug: 'kandy-spice',
    plan: 'PRO',
    status: 'ACTIVE',
    country: 'LK',
    aiRepliesUsed: 1230,
    aiRepliesQuota: 5000,
    mrr: 49,
    ordersThisMonth: 8,
    joinedAt: 'May 20, 2026',
    ownerEmail: 'hello@kandyspice.lk',
    lastActive: '1 hour ago',
  },
  {
    id: 't4',
    name: 'Galle Surf Shop',
    slug: 'galle-surf',
    plan: 'TRIAL',
    status: 'TRIALING',
    country: 'LK',
    aiRepliesUsed: 87,
    aiRepliesQuota: 200,
    mrr: 0,
    ordersThisMonth: 2,
    joinedAt: 'Jul 18, 2026',
    ownerEmail: 'surf@gallesurf.lk',
    lastActive: '3 hours ago',
  },
  {
    id: 't5',
    name: 'Matara Beauty Boutique',
    slug: 'matara-beauty',
    plan: 'PRO',
    status: 'PAST_DUE',
    country: 'LK',
    aiRepliesUsed: 4980,
    aiRepliesQuota: 5000,
    mrr: 49,
    ordersThisMonth: 31,
    joinedAt: 'Feb 15, 2026',
    ownerEmail: 'billing@matara-beauty.lk',
    lastActive: '2 days ago',
  },
  {
    id: 't6',
    name: 'Negombo Fish Market',
    slug: 'negombo-fish',
    plan: 'PRO',
    status: 'SUSPENDED',
    country: 'LK',
    aiRepliesUsed: 0,
    aiRepliesQuota: 5000,
    mrr: 0,
    ordersThisMonth: 0,
    joinedAt: 'Mar 3, 2026',
    ownerEmail: 'owner@negombofish.lk',
    lastActive: '14 days ago',
  },
];

const recentActivity = [
  { id: 'a1', type: 'TENANT_SIGNUP', message: 'New tenant signed up: Galle Surf Shop', time: '3 hours ago', severity: 'info' },
  { id: 'a2', type: 'PAYMENT_FAILED', message: 'Payment failed for Matara Beauty Boutique (PRO Plan)', time: '1 day ago', severity: 'error' },
  { id: 'a3', type: 'QUOTA_WARNING', message: 'Colombo Electronics Hub at 91% AI quota usage', time: '2 hours ago', severity: 'warning' },
  { id: 'a4', type: 'PLAN_UPGRADED', message: 'Colombo Electronics Hub upgraded TRIAL → MAX', time: '2 months ago', severity: 'success' },
  { id: 'a5', type: 'TENANT_SUSPENDED', message: 'Negombo Fish Market account suspended (Non-payment)', time: '14 days ago', severity: 'error' },
  { id: 'a6', type: 'QUOTA_TOPUP', message: 'Matara Beauty Boutique purchased +1,000 AI reply top-up', time: '5 days ago', severity: 'info' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const planColors: Record<string, string> = {
  TRIAL: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  PRO: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  MAX: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  TRIALING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAST_DUE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const activityColors: Record<string, string> = {
  info: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const activityIcons: Record<string, React.ReactNode> = {
  info: <Bell className="h-3.5 w-3.5" />,
  warning: <AlertTriangle className="h-3.5 w-3.5" />,
  error: <XCircle className="h-3.5 w-3.5" />,
  success: <CheckCircle2 className="h-3.5 w-3.5" />,
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`flex items-center text-xs font-semibold ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

function QuotaMiniBar({ used, quota, label }: { used: number; quota: number; label: string }) {
  const pct = Math.round((used / quota) * 100);
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-slate-300">{label}</span>
        <span className={pct >= 90 ? 'text-red-400 font-bold' : pct >= 70 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const activeTenants = mockTenants.filter((t) => t.status === 'ACTIVE').length;
  const totalMrr = mockTenants.reduce((sum, t) => sum + t.mrr, 0);
  const totalAiReplies = mockTenants.reduce((sum, t) => sum + t.aiRepliesUsed, 0);

  const filtered = mockTenants.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'ALL' || t.plan === planFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#0b0f17]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">Super Admin</p>
            <p className="text-sm font-bold text-white leading-none">Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Platform Live
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-600 transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── HEADLINE ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="h-3.5 w-3.5" /> Super Admin Only — RESTRICTED ACCESS
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Global Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Manage all business tenants, subscriptions, AI usage, and platform health</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-600 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
            </button>
          </div>
        </div>

        {/* ── PLATFORM STATS ROW ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="lg:col-span-2">
            <StatCard
              label="Total Business Tenants"
              value="42"
              sub={`${activeTenants} Active • 4 Trialing • 2 Suspended`}
              icon={Building2}
              iconColor="bg-blue-500/10 text-blue-400"
              trend="+3 this month"
              trendUp
            />
          </div>
          <div className="lg:col-span-2">
            <StatCard
              label="Monthly Recurring Revenue"
              value="$3,420"
              sub="Avg $81/tenant • $41,040 ARR run-rate"
              icon={DollarSign}
              iconColor="bg-emerald-500/10 text-emerald-400"
              trend="+$490 MoM"
              trendUp
            />
          </div>
          <div className="lg:col-span-2">
            <StatCard
              label="Platform AI Cost (Est.)"
              value="$412.80"
              sub="Gross Margin: 87.9% — OpenAI/Gemini cost"
              icon={Bot}
              iconColor="bg-purple-500/10 text-purple-400"
              trend="+$38 MoM"
              trendUp={false}
            />
          </div>
          <div className="lg:col-span-2">
            <StatCard
              label="Total AI Replies (Month)"
              value="184,200"
              sub="Avg response time: 1.1s • 0.3% error rate"
              icon={Sparkles}
              iconColor="bg-teal-500/10 text-teal-400"
              trend="+22%"
              trendUp
            />
          </div>
        </div>

        {/* ── SECONDARY STATS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Orders (Platform)', value: '2,841', icon: Package, color: 'bg-indigo-500/10 text-indigo-400' },
            { label: 'WhatsApp Conversations', value: '48,302', icon: MessageSquare, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Past Due Accounts', value: '1', icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-400' },
            { label: 'Suspended Accounts', value: '1', icon: Ban, color: 'bg-red-500/10 text-red-400' },
            { label: 'Churn Rate (30d)', value: '2.4%', icon: TrendingDown, color: 'bg-rose-500/10 text-rose-400' },
            { label: 'Active Users (Staff)', value: '89', icon: Users, color: 'bg-violet-500/10 text-violet-400' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${s.color}`}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID: TENANT TABLE + SIDEBAR ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── TENANT TABLE (col-span-2) ──────────────────────── */}
          <div className="xl:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Business Tenant Management</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {filtered.length} of {mockTenants.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tenants..."
                    className="w-48 rounded-xl bg-slate-950 border border-slate-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
                  />
                </div>
                {/* Plan Filter */}
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Plans</option>
                  <option value="TRIAL">Trial</option>
                  <option value="PRO">Pro</option>
                  <option value="MAX">Max</option>
                </select>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TRIALING">Trialing</option>
                  <option value="PAST_DUE">Past Due</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">AI Usage</th>
                    <th className="py-3 px-4">MRR</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map((tenant) => {
                    const quotaPct = Math.round((tenant.aiRepliesUsed / tenant.aiRepliesQuota) * 100);
                    const isSelected = selectedTenant?.id === tenant.id;
                    return (
                      <tr
                        key={tenant.id}
                        onClick={() => setSelectedTenant(isSelected ? null : tenant)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Business */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                              {tenant.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{tenant.name}</p>
                              <p className="text-slate-500 text-[10px]">{tenant.ownerEmail}</p>
                            </div>
                          </div>
                        </td>
                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${planColors[tenant.plan]}`}>
                            {tenant.plan}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColors[tenant.status]}`}>
                            {tenant.status === 'PAST_DUE' ? 'PAST DUE' : tenant.status}
                          </span>
                        </td>
                        {/* AI Usage */}
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">
                                {tenant.aiRepliesUsed.toLocaleString()} / {tenant.aiRepliesQuota.toLocaleString()}
                              </span>
                              <span className={`font-bold ${quotaPct >= 90 ? 'text-red-400' : quotaPct >= 70 ? 'text-amber-400' : 'text-slate-400'}`}>
                                {quotaPct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${quotaPct >= 90 ? 'bg-red-500' : quotaPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(quotaPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        {/* MRR */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white">${tenant.mrr}</span>
                        </td>
                        {/* Orders */}
                        <td className="py-3.5 px-4 text-slate-300">{tenant.ordersThisMonth}</td>
                        {/* Last Active */}
                        <td className="py-3.5 px-4 text-slate-400">{tenant.lastActive}</td>
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant); }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-all"
                              title="Suspend Account"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Plan Distribution Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center gap-6">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Plan Mix:</span>
              {[
                { plan: 'TRIAL', count: mockTenants.filter((t) => t.plan === 'TRIAL').length, color: 'bg-slate-500' },
                { plan: 'PRO', count: mockTenants.filter((t) => t.plan === 'PRO').length, color: 'bg-indigo-500' },
                { plan: 'MAX', count: mockTenants.filter((t) => t.plan === 'MAX').length, color: 'bg-emerald-500' },
              ].map(({ plan, count, color }) => (
                <div key={plan} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-[11px] text-slate-400">
                    {plan} <span className="font-bold text-white">{count}</span>
                  </span>
                </div>
              ))}
              <span className="ml-auto text-[11px] text-slate-400">
                Total MRR: <span className="font-bold text-emerald-400">${totalMrr}/mo</span>
              </span>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────── */}
          <div className="space-y-4">

            {/* Tenant Detail Panel */}
            {selectedTenant ? (
              <div className="rounded-2xl bg-slate-900/60 border border-emerald-500/30 p-5 space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-400" /> Tenant Detail
                  </h3>
                  <button onClick={() => setSelectedTenant(null)} className="text-slate-500 hover:text-slate-300">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {selectedTenant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedTenant.name}</p>
                    <p className="text-[11px] text-slate-400">{selectedTenant.ownerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Plan', value: selectedTenant.plan },
                    { label: 'Status', value: selectedTenant.status },
                    { label: 'Country', value: selectedTenant.country },
                    { label: 'Joined', value: selectedTenant.joinedAt },
                    { label: 'MRR', value: `$${selectedTenant.mrr}` },
                    { label: 'Orders', value: selectedTenant.ordersThisMonth },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">{label}</p>
                      <p className="font-bold text-white mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <QuotaMiniBar
                  used={selectedTenant.aiRepliesUsed}
                  quota={selectedTenant.aiRepliesQuota}
                  label={`AI Replies: ${selectedTenant.aiRepliesUsed.toLocaleString()} / ${selectedTenant.aiRepliesQuota.toLocaleString()}`}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all">
                    Impersonate
                  </button>
                  <button className="py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:border-red-500/50 hover:text-red-400 transition-all">
                    Suspend
                  </button>
                  <button className="py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all col-span-2">
                    Grant Grace Quota (+500)
                  </button>
                </div>
              </div>
            ) : (
              /* Platform Health Card (shown when no tenant selected) */
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" /> Platform Health
                </h3>
                {[
                  { label: 'API Response Time', value: '48ms', status: 'ok' },
                  { label: 'Database Connections', value: '12 / 100', status: 'ok' },
                  { label: 'Redis Cache Hit Rate', value: '94.2%', status: 'ok' },
                  { label: 'AI Provider Error Rate', value: '0.3%', status: 'ok' },
                  { label: 'Webhook Queue Depth', value: '2 pending', status: 'ok' },
                  { label: 'Disk Usage (pgdata)', value: '18.4 GB', status: 'warn' },
                ].map(({ label, value, status }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${status === 'warn' ? 'text-amber-400' : 'text-white'}`}>{value}</span>
                      <span className={`h-2 w-2 rounded-full ${status === 'warn' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top AI Consumers */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" /> Top AI Consumers
              </h3>
              {[...mockTenants]
                .sort((a, b) => b.aiRepliesUsed - a.aiRepliesUsed)
                .slice(0, 4)
                .map((t) => {
                  const pct = Math.round((t.aiRepliesUsed / t.aiRepliesQuota) * 100);
                  return (
                    <div key={t.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{t.name}</span>
                        <span className={`font-bold text-[10px] ${pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {t.aiRepliesUsed.toLocaleString()} / {t.aiRepliesQuota.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>

        {/* ── REVENUE & ACTIVITY ROW ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue Breakdown */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" /> Revenue Breakdown
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">July 2026</span>
            </div>

            {/* MRR by Plan */}
            <div className="space-y-3">
              {[
                { plan: 'MAX Plan', tenants: 1, mrr: 149, color: 'bg-emerald-500', pct: 43 },
                { plan: 'PRO Plan', tenants: 4, mrr: 196, color: 'bg-indigo-500', pct: 57 },
                { plan: 'TRIAL Plan', tenants: 1, mrr: 0, color: 'bg-slate-600', pct: 0 },
              ].map((row) => (
                <div key={row.plan} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-sm ${row.color}`} />
                      <span className="text-slate-300">{row.plan}</span>
                      <span className="text-slate-500 text-[10px]">({row.tenants} tenant{row.tenants !== 1 ? 's' : ''})</span>
                    </div>
                    <span className="font-bold text-white">${row.mrr}/mo</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${row.color} h-full rounded-full`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Platform MRR</span>
              <span className="text-xl font-extrabold text-emerald-400">${totalMrr}</span>
            </div>

            {/* Top-Up Revenue */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Top-Up Revenue (Add-ons)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Extra AI reply packs purchased this month</p>
              </div>
              <span className="text-lg font-bold text-indigo-400">$120</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> Platform Activity Log
              </h3>
              <button className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${activityColors[event.severity]}`}>
                    {activityIcons[event.severity]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 font-medium leading-snug">{event.message}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
