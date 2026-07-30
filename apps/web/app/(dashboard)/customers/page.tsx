'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  language: string;
  tags: string[];
  createdAt: string;
  orders?: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-400" /> WhatsApp Customers
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Live customer profiles, language preferences, lifetime orders, and tags captured from WhatsApp
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone number..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">WhatsApp Phone</th>
                <th className="py-3 px-4">Language Preference</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No customers found yet. Customers who message your WhatsApp business number will appear here automatically!
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">{c.name || 'WhatsApp Customer'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{c.phone}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px]">
                        {c.language || 'AUTO'} (Sinhala / English)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {c.orders?.length || 0} Orders
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags?.length ? c.tags : ['Active WhatsApp Customer']).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
