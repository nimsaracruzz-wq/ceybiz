'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bot, UserCheck, Send, Loader2, Sparkles,
  RefreshCw, ArrowLeft, Trash2, MessageCircle, X, Mic,
  Bell,
} from 'lucide-react';

const API = 'http://localhost:4000';
const POLL_MS = 2000; // poll every 2 seconds for near-realtime updates

interface ConvItem {
  id: string;
  name: string;
  phone: string;
  lastMsg: string;
  time: string;
  mode: 'AI' | 'HUMAN';
  unread: number;
}

interface MsgItem {
  id: string;
  sender: 'CUSTOMER' | 'AI' | 'HUMAN_AGENT';
  content: string;
  messageType?: string;
  mediaUrl?: string;
  time: string;
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = [
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-sky-400 to-blue-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const sz = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-white shrink-0 shadow-md`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function ModeBadge({ mode }: { mode: 'AI' | 'HUMAN' }) {
  return mode === 'AI' ? (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <Bot className="h-2.5 w-2.5" /> AI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
      <UserCheck className="h-2.5 w-2.5" /> Human
    </span>
  );
}

export default function InboxPage() {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<MsgItem[]>([]);
  const [mode, setMode] = useState<'AI' | 'HUMAN'>('AI');
  const [activeCustomer, setActiveCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newMsgToast, setNewMsgToast] = useState<string | null>(null);

  // Use refs to hold mutable values accessible in interval callbacks without stale closures
  const selectedIdRef = useRef<string | null>(null);
  const msgsRef = useRef<MsgItem[]>([]);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const convsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const msgsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  selectedIdRef.current = selectedId;
  msgsRef.current = msgs;

  const scrollToBottom = (smooth = true) => {
    msgsEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // ── Fetch conversation list ────────────────────────────────────────────
  const fetchConvs = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await fetch(`${API}/conversations`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: ConvItem[] = data.map((c: any) => ({
        id: c.id,
        name: c.customer?.name || `WA User (${(c.customer?.phone || '').slice(-4)})`,
        phone: c.customer?.phone || '',
        lastMsg: c.lastMessageText || c.messages?.[0]?.content || '',
        time: new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: c.mode || 'AI',
        unread: c.unreadCount || 0,
      }));

      setConvs(prev => {
        // Detect new unread messages from existing conversations and show toast
        for (const updated of mapped) {
          const old = prev.find(p => p.id === updated.id);
          if (old && updated.unread > old.unread && updated.id !== selectedIdRef.current) {
            setNewMsgToast(`New message from ${updated.name}`);
            setTimeout(() => setNewMsgToast(null), 4000);
          }
        }
        return mapped;
      });

      // Auto-select first conversation on initial load
      if (initial && mapped.length > 0) {
        setSelectedId(mapped[0].id);
      }
    } catch {
      // silent
    } finally {
      if (initial) setLoading(false);
    }
  };

  // ── Fetch messages for selected conversation ───────────────────────────
  const fetchMsgs = async (id: string, silent = false) => {
    try {
      if (!silent) setMsgsLoading(true);
      const res = await fetch(`${API}/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setMode(data.mode || 'AI');
      setActiveCustomer({ name: data.customer?.name || 'Customer', phone: data.customer?.phone || '' });

      const mapped: MsgItem[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        sender: m.sender,
        content: m.content || '',
        messageType: m.messageType,
        mediaUrl: m.mediaUrl,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      // Only update if message count changed to avoid re-render flicker
      setMsgs(prev => {
        const hasNew = mapped.length !== prev.length || (mapped.length > 0 && mapped[mapped.length - 1].id !== prev[prev.length - 1]?.id);
        if (hasNew) {
          // Scroll to bottom when new messages arrive
          setTimeout(() => scrollToBottom(), 50);
          return mapped;
        }
        return prev;
      });
    } catch {
      // silent
    } finally {
      if (!silent) setMsgsLoading(false);
    }
  };

  // ── Start conversations polling ────────────────────────────────────────
  useEffect(() => {
    fetchConvs(true);
    convsIntervalRef.current = setInterval(() => fetchConvs(false), POLL_MS);
    return () => {
      if (convsIntervalRef.current) clearInterval(convsIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start messages polling when a conversation is selected ────────────
  useEffect(() => {
    if (msgsIntervalRef.current) clearInterval(msgsIntervalRef.current);
    if (!selectedId) return;

    fetchMsgs(selectedId);
    msgsIntervalRef.current = setInterval(() => {
      if (selectedIdRef.current) fetchMsgs(selectedIdRef.current, true);
    }, POLL_MS);

    return () => {
      if (msgsIntervalRef.current) clearInterval(msgsIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectConv = (id: string) => {
    setSelectedId(id);
    setShowChat(true);
    setMsgs([]);
  };

  const handleToggleMode = async (newMode: 'AI' | 'HUMAN') => {
    if (!selectedId) return;
    const res = await fetch(`${API}/conversations/${selectedId}/mode`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode }),
    });
    if (res.ok) {
      setMode(newMode);
      setConvs(p => p.map(c => (c.id === selectedId ? { ...c, mode: newMode } : c)));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedId || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    // Optimistic add
    const optimistic: MsgItem = {
      id: `opt_${Date.now()}`,
      sender: 'HUMAN_AGENT',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMsgs(p => [...p, optimistic]);
    setTimeout(() => scrollToBottom(), 50);
    try {
      await fetch(`${API}/conversations/${selectedId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msg }),
      });
      // Immediately refresh messages to get the DB-saved version
      await fetchMsgs(selectedId, true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/conversations/${id}`, { method: 'DELETE' });
      setConvs(p => p.filter(c => c.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setMsgs([]);
        setActiveCustomer(null);
        setShowChat(false);
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = convs.filter(
    c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  );

  return (
    <div style={{ height: 'calc(100vh - 6rem)' }} className="relative flex rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-950 shadow-2xl shadow-black/40">

      {/* ── New message toast ─────────────────────────────────────────── */}
      {newMsgToast && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold shadow-xl animate-bounce">
          <Bell className="h-3.5 w-3.5" />
          {newMsgToast}
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div className={['flex flex-col bg-slate-900/80 border-r border-slate-800/60 w-full md:w-80 lg:w-96 shrink-0', showChat ? 'hidden md:flex' : 'flex'].join(' ')}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Live Inbox</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">{convs.length} conversations · refreshes every 2s</p>
            </div>
            <button onClick={() => fetchConvs(true)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or number..." className="w-full rounded-xl bg-slate-800/70 border border-slate-700/50 py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600 px-6 text-center">
              <MessageCircle className="h-8 w-8" />
              <p className="text-xs">{search ? 'No results found.' : 'No conversations yet. WhatsApp messages appear here automatically.'}</p>
            </div>
          ) : (
            filtered.map(conv => {
              const isActive = selectedId === conv.id;
              return (
                <div key={conv.id} onClick={() => selectConv(conv.id)}
                  className={['group relative px-4 py-3.5 cursor-pointer transition-all duration-150 border-b border-slate-800/30 border-l-2', isActive ? 'bg-emerald-500/10 border-l-emerald-500' : 'border-l-transparent hover:bg-slate-800/40'].join(' ')}>
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar name={conv.name} />
                      {conv.unread > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-slate-900">
                          {conv.unread > 9 ? '9+' : conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs font-semibold truncate ${conv.unread > 0 ? 'text-white' : 'text-slate-200'}`}>{conv.name}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">{conv.time}</span>
                      </div>
                      <p className={`text-[11px] truncate leading-relaxed ${conv.unread > 0 ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>{conv.lastMsg}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <ModeBadge mode={conv.mode} />
                          <span className="text-[9px] text-slate-600 truncate max-w-[100px]">{conv.phone}</span>
                        </div>
                        <button onClick={e => handleDelete(conv.id, e)} disabled={deletingId === conv.id}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all" title="Delete conversation">
                          {deletingId === conv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CHAT PANEL ────────────────────────────────────────────────────── */}
      <div className={['flex-1 flex flex-col bg-[#080c12] min-w-0', !showChat ? 'hidden md:flex' : 'flex'].join(' ')}>
        {selectedId && activeCustomer ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800/60 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setShowChat(false)} className="md:hidden p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar name={activeCustomer.name} size="sm" />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{activeCustomer.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate">{activeCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ModeBadge mode={mode} />
                {mode === 'AI' ? (
                  <button onClick={() => handleToggleMode('HUMAN')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Take Over</span>
                  </button>
                ) : (
                  <button onClick={() => handleToggleMode('AI')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20">
                    <Bot className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Return to AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              ) : msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-700">
                  <MessageCircle className="h-6 w-6" />
                  <span className="text-xs">No messages yet</span>
                </div>
              ) : (
                msgs.map(msg => {
                  const isCustomer = msg.sender === 'CUSTOMER';
                  const isAI = msg.sender === 'AI';
                  const isHuman = msg.sender === 'HUMAN_AGENT';
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex items-end gap-2 max-w-[80%] ${isCustomer ? '' : 'flex-row-reverse'}`}>
                        {isCustomer && <Avatar name={activeCustomer.name} size="sm" />}
                        <div className={['rounded-2xl px-3.5 py-2.5 text-xs shadow-lg',
                          isCustomer ? 'bg-slate-800 text-white rounded-bl-sm border border-slate-700/50'
                          : isHuman ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-gradient-to-br from-emerald-900/80 to-teal-900/60 text-slate-100 rounded-br-sm border border-emerald-500/20',
                        ].join(' ')}>
                          {isAI && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-1"><Sparkles className="h-3 w-3" /> Maya AI</span>}
                          {isHuman && <span className="text-[10px] font-bold text-indigo-200 mb-1 block">Agent</span>}
                          {msg.messageType === 'AUDIO' ? (
                            <span className="flex items-center gap-1.5 text-slate-300 italic"><Mic className="h-3.5 w-3.5" /> Voice note</span>
                          ) : msg.messageType === 'IMAGE' && msg.mediaUrl ? (
                            <img src={msg.mediaUrl} alt="media" className="rounded-lg max-w-[200px] max-h-[200px] object-cover" />
                          ) : (
                            <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                          )}
                          <span className="block text-right text-[9px] opacity-50 mt-1">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={msgsEndRef} />
            </div>

            {/* Composer */}
            <div className="px-4 py-3 border-t border-slate-800/60 bg-slate-900/60 shrink-0">
              {mode === 'AI' && (
                <p className="mb-2 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Bot className="h-3 w-3 text-emerald-500" />
                  AI is handling this chat. Click <strong className="text-indigo-400">Take Over</strong> to reply manually.
                </p>
              )}
              {mode === 'HUMAN' && (
                <p className="mb-2 text-[10px] text-emerald-500/70 flex items-center gap-1.5">
                  <UserCheck className="h-3 w-3" />
                  Human mode active — your messages go directly to the customer on WhatsApp.
                </p>
              )}
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input type="text" value={text} onChange={e => setText(e.target.value)} disabled={mode === 'AI'}
                  placeholder={mode === 'AI' ? 'AI active — take over to reply...' : 'Type a message to the customer...'}
                  className="flex-1 rounded-xl bg-slate-800/80 border border-slate-700/50 py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" />
                <button type="submit" disabled={!text.trim() || sending || mode === 'AI'}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-all shadow-lg shadow-emerald-500/20">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-700">
            <div className="h-16 w-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">No conversation selected</p>
              <p className="text-xs text-slate-700 mt-1">Choose a chat from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
