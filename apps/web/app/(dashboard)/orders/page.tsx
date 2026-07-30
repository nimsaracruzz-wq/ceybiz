'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ChevronRight,
  Loader2,
  Printer,
  RefreshCw,
  X,
  PackageCheck,
  Building2,
  Phone,
  Search,
  CheckCircle2,
  Archive,
  Layers,
} from 'lucide-react';

interface OrderCard {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { name: string; variant?: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

const activeColumns = [
  { key: 'NEW', label: 'New Orders', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  { key: 'CONFIRMED', label: 'Confirmed', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  { key: 'PROCESSING', label: 'Processing', color: 'border-purple-500/50 bg-purple-500/10 text-purple-400' },
  { key: 'SHIPPED', label: 'Shipped & Out for Delivery', color: 'border-teal-500/50 bg-teal-500/10 text-teal-400' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [printOrder, setPrintOrder] = useState<OrderCard | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/orders');
      if (res.ok) {
        const data = await res.json();
        const mapped: OrderCard[] = data.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name || o.notes?.match(/Customer:\s*([^.]+)/)?.[1]?.trim() || 'WhatsApp Customer',
          customerPhone: o.customerPhone || o.customer?.phone || 'N/A',
          deliveryAddress: o.deliveryAddress || 'Islandwide Delivery',
          items: o.items?.map((i: any) => ({
            name: i.productName || 'Store Item',
            variant: i.variantName,
            quantity: i.quantity || 1,
            price: Number(i.unitPrice || 0),
          })) || [],
          subtotal: Number(o.subtotal || 0),
          deliveryFee: Number(o.deliveryFee || 350),
          total: Number(o.total || 0),
          paymentMethod: o.paymentMethod || 'COD',
          status: (o.status === 'PENDING' ? 'NEW' : o.status) || 'NEW',
          createdAt: new Date(o.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        }));
        setOrders(mapped);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const moveStatus = async (orderId: string, currentStatus: string) => {
    const statusSequence = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = statusSequence.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx >= statusSequence.length - 1) return;
    const nextStatus = statusSequence[currentIdx + 1];

    try {
      const res = await fetch(`http://localhost:4000/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o)),
        );
      }
    } catch {
      //
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeOrdersList = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const completedOrdersList = orders.filter(
    (o) =>
      (o.status === 'DELIVERED' || o.status === 'CANCELLED') &&
      (!search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-400" />
            WhatsApp Orders Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fulfill live WhatsApp orders and automatically archive delivered orders
          </p>
        </div>

        {/* TAB TOGGLE SWITCH */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Active Fulfillment Board ({activeOrdersList.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="h-3.5 w-3.5" /> Delivered & History ({orders.length - activeOrdersList.length})
          </button>
          <button
            onClick={fetchOrders}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white"
            title="Refresh Board"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE FULFILLMENT KANBAN BOARD */}
      {activeTab === 'ACTIVE' && (
        <>
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading active orders...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeColumns.map((col) => {
                const colOrders = activeOrdersList.filter((o) => o.status === col.key);
                return (
                  <div
                    key={col.key}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3 min-h-[300px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${col.color}`}>
                        {col.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{colOrders.length}</span>
                    </div>

                    <div className="space-y-3">
                      {colOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">#{ord.orderNumber}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                              {ord.paymentMethod}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-white">{ord.customerName}</p>
                            <p className="text-[10px] text-slate-400">{ord.customerPhone}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{ord.deliveryAddress}</p>
                          </div>

                          <div className="text-[11px] text-slate-300 border-t border-b border-slate-800/80 py-1.5 space-y-0.5">
                            {ord.items.map((it, idx) => (
                              <p key={idx} className="truncate">
                                • {it.name} {it.variant ? `(${it.variant})` : ''} x{it.quantity}
                              </p>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => setPrintOrder(ord)}
                              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1"
                            >
                              <Printer className="h-3 w-3 text-emerald-400" /> Slip
                            </button>

                            <button
                              onClick={() => moveStatus(ord.id, ord.status)}
                              className="text-[10px] text-emerald-400 hover:underline flex items-center font-bold"
                            >
                              {ord.status === 'SHIPPED' ? 'Mark Delivered ✅' : 'Move Next'} <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {colOrders.length === 0 && (
                        <p className="text-[11px] text-slate-500 text-center py-12 border border-dashed border-slate-800/80 rounded-xl">
                          No orders
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: DELIVERED & HISTORY ARCHIVE */}
      {activeTab === 'COMPLETED' && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archived orders..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              Showing {completedOrdersList.length} completed/archived orders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedOrdersList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No archived orders found. Delivered orders will move here automatically!
                    </td>
                  </tr>
                ) : (
                  completedOrdersList.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-emerald-400">#{ord.orderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-white">{ord.customerName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{ord.customerPhone}</td>
                      <td className="py-3 px-4">
                        {ord.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">Rs. {ord.total.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPrintOrder(ord)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] inline-flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3 text-emerald-400" /> Print Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT PACKAGING SLIP MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:p-0 print:bg-white print:static">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6 border border-slate-300 print:shadow-none print:border-none print:w-full print:max-w-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Printer className="h-4 w-4 text-emerald-600" /> Dispatch Packaging Slip
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Now
                </button>
                <button onClick={() => setPrintOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5 print:space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-5 w-5 text-emerald-600" /> Demo Fashion Store
                  </h2>
                  <p className="text-[11px] text-slate-500">Colombo 03, Sri Lanka | WhatsApp Sales Dispatch</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded">
                    #{printOrder.orderNumber}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{printOrder.createdAt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Details</span>
                  <p className="font-bold text-slate-900">{printOrder.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {printOrder.customerPhone}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Address & Payment</span>
                  <p className="text-slate-700 leading-snug font-medium">{printOrder.deliveryAddress}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded text-slate-800">
                    Payment: {printOrder.paymentMethod}
                  </span>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-semibold text-slate-800">
                          {it.name} {it.variant ? `(${it.variant})` : ''}
                        </td>
                        <td className="py-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="py-2.5 text-right font-semibold">Rs. {(it.price * it.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-300 pt-3 text-xs space-y-1 text-right">
                <p className="text-slate-500">Subtotal: <span className="font-semibold text-slate-800">Rs. {printOrder.subtotal.toLocaleString()}</span></p>
                <p className="text-slate-500">Delivery Fee: <span className="font-semibold text-slate-800">Rs. {printOrder.deliveryFee.toLocaleString()}</span></p>
                <p className="text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  Total Payable: <span className="text-emerald-700">Rs. {printOrder.total.toLocaleString()}</span>
                </p>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-dashed border-slate-300">
                <p className="font-semibold text-slate-600">Thank you for shopping with Demo Fashion Store!</p>
                <p>Order processed automatically by WhatsApp AI Assistant</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
