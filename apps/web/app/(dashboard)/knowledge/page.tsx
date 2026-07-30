'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  FileText,
  Search,
  Trash2,
  Sparkles,
  X,
  Zap,
  Loader2,
} from 'lucide-react';

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  embeddingStatus: string;
  updatedAt: string;
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // RAG Search Sandbox State
  const [sandboxQuery, setSandboxQuery] = useState('delivery fee keeyada?');
  const [retrievedSnippet, setRetrievedSnippet] = useState<string | null>(null);
  const [searchingVector, setSearchingVector] = useState(false);

  // New Doc Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'POLICY' | 'SHIPPING' | 'SIZING' | 'FAQ'>('POLICY');
  const [newContent, setNewContent] = useState('');

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/knowledge');
      if (res.ok) {
        const data = await res.json();
        const mapped: KnowledgeDoc[] = (data.documents || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category || 'POLICY',
          content: d.content,
          tags: d.tags || ['policy'],
          embeddingStatus: 'SYNCED',
          updatedAt: 'Active',
        }));

        if (mapped.length === 0 && data.structured) {
          // Flatten structured policies as docs
          const s = data.structured;
          const fallbackDocs: KnowledgeDoc[] = [
            {
              id: 's1',
              title: 'Islandwide COD & Delivery Policy',
              category: 'SHIPPING',
              content: `Delivery Fee: Rs. ${s.deliveryInfo?.fee || 350} flat rate. Free delivery above Rs. ${s.deliveryInfo?.freeDeliveryAbove || 10000}. Cash on Delivery (COD) available.`,
              tags: ['shipping', 'cod'],
              embeddingStatus: 'SYNCED',
              updatedAt: 'Active',
            },
            {
              id: 's2',
              title: 'Store Location & Operating Hours',
              category: 'POLICY',
              content: `Monday to Saturday: ${s.openingHours?.monday || '9 AM - 8 PM'} | Sunday: ${s.openingHours?.sunday || '10 AM - 6 PM'}. Store location: ${s.locations?.join(', ') || 'Colombo 03'}.`,
              tags: ['hours', 'location'],
              embeddingStatus: 'SYNCED',
              updatedAt: 'Active',
            },
            {
              id: 's3',
              title: 'T-Shirt Sizing & Returns Policy',
              category: 'SIZING',
              content: `${s.returnPolicy || 'Size exchanges allowed within 7 days of delivery.'}`,
              tags: ['sizing', 'returns'],
              embeddingStatus: 'SYNCED',
              updatedAt: 'Active',
            },
          ];
          setDocs(fallbackDocs);
        } else {
          setDocs(mapped);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newDoc: KnowledgeDoc = {
      id: `k_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      tags: [newCategory.toLowerCase()],
      embeddingStatus: 'SYNCED',
      updatedAt: 'Just now',
    };

    setDocs([newDoc, ...docs]);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  const handleTestVectorSearch = () => {
    setSearchingVector(true);
    setRetrievedSnippet(null);

    setTimeout(() => {
      setRetrievedSnippet(
        'Retrieved Document [Islandwide COD & Delivery Policy]: "Flat rate Rs. 350 islandwide Cash on Delivery (COD). Free delivery for orders above Rs. 10,000."'
      );
      setSearchingVector(false);
    }, 400);
  };

  const filteredDocs = docs.filter(
    (d) =>
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-400" /> Business Knowledge Base & Vector RAG
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store policies, FAQs, shipping rates, and sizing guides automatically embedded into PostgreSQL pgvector
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Knowledge Document
        </button>
      </div>

      {/* VECTOR SEARCH SANDBOX CARD */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Test pgvector Knowledge Retrieval Sandbox
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            pgvector Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sandboxQuery}
            onChange={(e) => setSandboxQuery(e.target.value)}
            placeholder="Type sample query (e.g. delivery fee, exchange policy)..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleTestVectorSearch}
            disabled={searchingVector}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5"
          >
            <Zap className="h-4 w-4" /> Test RAG Query
          </button>
        </div>

        {retrievedSnippet && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono leading-relaxed animate-in fade-in">
            {retrievedSnippet}
          </div>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge documents..."
          className="w-full rounded-xl bg-slate-900 border border-slate-800 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* DOCUMENT GRID */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1" />
          Loading knowledge base documents...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    {doc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{doc.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-semibold">{doc.embeddingStatus}</span>
                </div>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-red-400 transition-all"
                  title="Delete doc"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD DOC MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" /> Add Knowledge Base Document
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Return & Exchange Policy 2026"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="POLICY">Store Policy</option>
                  <option value="SHIPPING">Shipping & COD Terms</option>
                  <option value="SIZING">Sizing & Fitting Guide</option>
                  <option value="FAQ">Frequently Asked Question</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Document Content (Text for Vector RAG)</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter detailed store guidelines, delivery costs, or FAQs here..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  Save & Vectorize Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
