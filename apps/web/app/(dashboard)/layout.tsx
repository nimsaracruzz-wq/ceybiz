'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
  Package,
  BookOpen,
  Send,
  Image as ImageIcon,
  BarChart3,
  Bot,
  UserCheck,
  CreditCard,
  Settings,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: 'Live' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, badge: '3 New' },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Knowledge', href: '/knowledge', icon: BookOpen },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Media', href: '/media', icon: ImageIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'WhatsApp Simulator', href: '/simulator', icon: Smartphone, highlight: true },
];

const settingItems = [
  { name: 'WhatsApp Connect', href: '/settings/whatsapp', icon: Smartphone },
  { name: 'AI Assistant', href: '/settings/ai', icon: Bot },
  { name: 'Team', href: '/team', icon: UserCheck },
  { name: 'Billing & Quotas', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Super Admin', href: '/admin', icon: ShieldAlert },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [aiActive, setAiActive] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17]">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-slate-800/80 bg-[#0f172a]/60 backdrop-blur-md">
        {/* LOGO */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">WhatsApp AI</span>
              <span className="block text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Sales SaaS</span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Platform</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                        : item.highlight
                        ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Configuration</p>
            <nav className="space-y-1">
              {settingItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM BUSINESS SWITCHER & PROFILE */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                DF
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Demo Fashion Store</p>
                <p className="text-[10px] text-slate-400">PRO Plan • Active</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER NAV */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#0f172a]/40 px-6 backdrop-blur-md">
          {/* SEARCH BAR */}
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                className="w-full rounded-xl bg-slate-900/80 border border-slate-800 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* RIGHT STATUS INDICATORS */}
          <div className="flex items-center gap-4">
            {/* WHATSAPP CONNECTION STATUS */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              WhatsApp Connected
            </div>

            {/* AI TOGGLE STATUS */}
            <button
              onClick={() => setAiActive(!aiActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                aiActive
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant: {aiActive ? 'ACTIVE' : 'PAUSED'}</span>
            </button>

            {/* QUOTA USAGE PILL */}
            <Link
              href="/billing"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700"
            >
              <span className="text-slate-400">AI Quota:</span>
              <span className="font-semibold text-emerald-400">3,842 / 5,000</span>
            </Link>

            {/* NOTIFICATION BELL */}
            <button className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            </button>

            {/* USER AVATAR */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                KP
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f17] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
