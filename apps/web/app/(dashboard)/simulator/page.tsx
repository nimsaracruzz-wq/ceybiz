'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Info,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'AI' | 'SYSTEM';
  text: string;
  time: string;
  tools?: string[];
  order?: any;
}

export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'AI',
      text: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද? 😊',
      time: '10:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [quotaCount, setQuotaCount] = useState(3842);
  const [businessId, setBusinessId] = useState<string>('58d388c6-182b-4ced-9dd2-f0df333a1de3');
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Resolve the real business UUID from the API on mount
  useEffect(() => {
    fetch('http://localhost:4000/simulator/business/demo-fashion')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setBusinessId(data.id);
          setApiStatus('ok');
        } else {
          setApiStatus('error');
        }
      })
      .catch(() => setApiStatus('error'));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'CUSTOMER',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Direct call to NestJS backend — NO local hardcoded fallback
      const res = await fetch('http://localhost:4000/simulator/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessId || '58d388c6-182b-4ced-9dd2-f0df333a1de3',
          customerPhone: '+94779876543',
          customerName: 'Nimal Perera',
          content: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveTools(data.toolsUsed || []);
        if (data.orderCreated) {
          setLastOrder(data.orderCreated);
        }
        setQuotaCount((prev) => prev + 1);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: data.outboundMessage?.content || 'Sorry, I could not generate a response.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tools: data.toolsUsed,
          order: data.orderCreated,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'SYSTEM',
          text: `⚠️ API Error (${res.status}): ${errData.message || 'Failed to process message with Gemini AI'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'SYSTEM',
        text: `⚠️ Network Connection Error: Could not reach API at http://localhost:4000. Make sure backend is running.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-emerald-400" />
            WhatsApp AI Development Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Real-time chat connected directly to NestJS backend & Live Google Gemini 2.5 Flash
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Gemini API Connection Status */}
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              apiStatus === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : apiStatus === 'error'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiStatus === 'ok'
                  ? 'bg-emerald-400 animate-pulse'
                  : apiStatus === 'error'
                  ? 'bg-amber-400'
                  : 'bg-slate-500 animate-pulse'
              }`}
            />
            {apiStatus === 'ok' ? 'Gemini 2.5 Flash Live' : 'Connecting to API...'}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">AI Replies:</span>{' '}
            <span className="font-bold text-emerald-400">{quotaCount} / 5,000</span>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  id: '1',
                  sender: 'AI',
                  text: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද? 😊',
                  time: '10:00 AM',
                },
              ]);
              setActiveTools([]);
              setLastOrder(null);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: WHATSAPP CHAT PHONE SIMULATOR (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] rounded-3xl bg-[#0b141a] border border-slate-800 shadow-2xl overflow-hidden">
          {/* WHATSAPP TOP BAR */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                DF
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-100">Demo Fashion Store (WhatsApp Business)</h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> 24/7 Gemini AI Assistant Online
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              PRO Business
            </span>
          </div>

          {/* CHAT MESSAGES WATERMARK BACKGROUND */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'CUSTOMER'
                    ? 'items-end'
                    : msg.sender === 'SYSTEM'
                    ? 'items-center'
                    : 'items-start'
                }`}
              >
                {msg.sender === 'SYSTEM' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-mono my-1 max-w-[90%] text-center">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md space-y-1.5 ${
                      msg.sender === 'CUSTOMER'
                        ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                        : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/40'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1.5 text-[9px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'CUSTOMER' && <span className="text-teal-400 font-bold">✓✓</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#202c33] text-xs text-slate-400 w-max animate-pulse">
                <Bot className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                Gemini 2.5 Flash is thinking & searching database...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK TRILINGUAL PRESET PROMPTS */}
          <div className="p-2.5 bg-[#111b21] border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Presets:</span>
            <button
              onClick={() => sendMessage('black tshirt XL තියෙනවද?')}
              className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[11px] text-emerald-300 border border-slate-700 shrink-0"
            >
              "black tshirt XL තියෙනවද?"
            </button>
            <button
              onClick={() => sendMessage('price eka kiyada?')}
              className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[11px] text-emerald-300 border border-slate-700 shrink-0"
            >
              "price eka kiyada?"
            </button>
            <button
              onClick={() => sendMessage('Sunday open ද?')}
              className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[11px] text-emerald-300 border border-slate-700 shrink-0"
            >
              "Sunday open ද?"
            </button>
            <button
              onClick={() => sendMessage('I want to buy 1 black tshirt in XL size')}
              className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[11px] text-emerald-300 border border-slate-700 shrink-0"
            >
              "I want to buy"
            </button>
          </div>

          {/* INPUT COMPOSER */}
          <div className="p-3 bg-[#202c33] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type message in Sinhala, Singlish, or English..."
              className="flex-1 rounded-xl bg-[#2a3942] border-none px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 font-bold"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RIGHT: REAL-TIME AI INSPECTION & TOOL CALLING PANEL (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          {/* INSPECTOR PANEL */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Live Gemini 2.5 Flash Tool Calling Inspector
            </h3>

            {/* AI TOOLS USED */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Backend Tools Invoked by Gemini:</p>
              {activeTools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                      {tool}()
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No backend tools needed for this turn</p>
              )}
            </div>

            {/* REAL ORDER GENERATED CARD */}
            {lastOrder && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    New Order Created #{lastOrder.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {lastOrder.paymentMethod || 'COD'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    Item:{' '}
                    <span className="font-semibold text-white">
                      {lastOrder.items?.[0]?.productName || 'Black Oversized T-Shirt'}
                    </span>
                  </p>
                  <p>
                    Total:{' '}
                    <span className="font-bold text-emerald-400">
                      Rs. {lastOrder.total || lastOrder.totalPrice || 4850}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Delivery Address: {lastOrder.deliveryAddress || 'Collected via WhatsApp'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Info className="h-3.5 w-3.5 text-emerald-400" />
                Live Gemini Integration:
              </div>
              <p>
                Every message is processed directly by <span className="font-mono text-emerald-300">Gemini 2.5 Flash</span> via the NestJS API with database function calling (`searchProducts`, `searchKnowledge`, `createOrder`). No hardcoded mock messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
