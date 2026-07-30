'use client';

import React, { useState } from 'react';
import {
  Send,
  Plus,
  Clock,
  Sparkles,
  X,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Layers,
  Zap,
  Trash2,
  FolderPlus,
  UploadCloud,
  Loader2,
} from 'lucide-react';

interface SequenceSet {
  id: string;
  setName: string;
  photos: string[];
  textDescription: string;
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'AUTO_REPLY_SEQUENCE' | 'BROADCASTS'>('AUTO_REPLY_SEQUENCE');
  const [savedToast, setSavedToast] = useState(false);
  const [uploadingSetId, setUploadingSetId] = useState<string | null>(null);

  // Multi-Set Auto Reply Sequence State
  const [sequenceSets, setSequenceSets] = useState<SequenceSet[]>([
    {
      id: 'set-1',
      setName: 'Set 1: Premium T-Shirt Collection',
      photos: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      ],
      textDescription: `👕 *SET 1: T-SHIRT COLLECTION (Rs. 3,800 - Rs. 4,500)*\n• Black Oversized Heavy Cotton Tee (Rs. 4,500)\n• White Essential Crewneck Tee (Rs. 3,800)\n\n📦 Available Sizes: S, M, L, XL, XXL`,
    },
    {
      id: 'set-2',
      setName: 'Set 2: Jackets & Cargo Pants',
      photos: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      ],
      textDescription: `👖 *SET 2: JACKETS & CARGO PANTS (Rs. 6,800 - Rs. 12,500)*\n• Vintage Wash Denim Jacket (Rs. 12,500)\n• Beige Cargo Jogger Pants (Rs. 6,800)\n\n📦 Available Sizes: M, L, XL`,
    },
    {
      id: 'set-3',
      setName: 'Set 3: Store Address & Ordering Guide',
      photos: [],
      textDescription: `📍 *DEMO FASHION STORE ADDRESS & ORDERING GUIDE*\n\nAddress: No. 45, Galle Road, Colombo 03\nHours: Mon-Sat 9AM-8PM | Sun 10AM-6PM\n\n🚚 Islandwide Delivery: Flat Rs. 350 | Free on orders > Rs. 10,000!\n💳 Payment: Cash on Delivery (COD) or Direct Bank Transfer (10% Off)\n\nReply with product name & size to place your order now!`,
    },
  ]);

  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:4000/ai/config');
      if (res.ok) {
        const data = await res.json();
        if (data.customInstructions && data.customInstructions.startsWith('[')) {
          const parsed = JSON.parse(data.customInstructions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSequenceSets(parsed);
          }
        }
      }
    } catch {
      //
    }
  };

  React.useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddSet = () => {
    const newSet: SequenceSet = {
      id: `set-${Date.now()}`,
      setName: `Set ${sequenceSets.length + 1}: New Product Category`,
      photos: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'],
      textDescription: `📦 *SET ${sequenceSets.length + 1}: NEW CATEGORY DETAILS*\nWrite your set description & prices here...`,
    };
    setSequenceSets([...sequenceSets, newSet]);
  };

  const handleDeleteSet = (id: string) => {
    setSequenceSets(sequenceSets.filter((s) => s.id !== id));
  };

  const handleUpdateSet = (id: string, field: keyof SequenceSet, value: any) => {
    setSequenceSets(
      sequenceSets.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // DIRECT FILE UPLOAD FROM COMPUTER FOR SEQUENCE SETS
  const handleUploadPhotoToSet = async (setId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSetId(setId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:4000/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSequenceSets((prev) =>
          prev.map((s) => (s.id === setId ? { ...s, photos: [...s.photos, data.url] } : s))
        );
      }
    } catch {
      //
    } finally {
      setUploadingSetId(null);
    }
  };

  const handleRemovePhotoFromSet = (setId: string, photoIdx: number) => {
    setSequenceSets(
      sequenceSets.map((s) =>
        s.id === setId
          ? { ...s, photos: s.photos.filter((_, idx) => idx !== photoIdx) }
          : s
      )
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4000/ai/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceSets }),
      });

      if (res.ok) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="h-6 w-6 text-emerald-400" />
            Set-by-Set Customizable Auto-Reply Sequence Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload photo sets directly from your device & set automatic reply text messages
          </p>
        </div>
      </div>

      {/* TOP TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('AUTO_REPLY_SEQUENCE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUTO_REPLY_SEQUENCE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" /> Multi-Set Sequence Builder ({sequenceSets.length} Sets)
          </button>
        </div>

        <button
          onClick={handleAddSet}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
        >
          <FolderPlus className="h-4 w-4" /> Add New Sequence Set
        </button>
      </div>

      {savedToast && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          All Set-by-Set Photo & Text Auto-Reply Sequences saved live!
        </div>
      )}

      {/* MULTI-SET BUILDER CARDS */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {sequenceSets.map((set, setIdx) => (
          <div
            key={set.id}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  #{setIdx + 1}
                </span>
                <input
                  type="text"
                  value={set.setName}
                  onChange={(e) => handleUpdateSet(set.id, 'setName', e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500/50 flex-1 max-w-md"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDeleteSet(set.id)}
                className="p-2 text-slate-500 hover:text-red-400"
                title="Delete Set"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PHOTOS IN THIS SET */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-emerald-400" /> Set Photos ({set.photos.length} Photos)
                  </h4>

                  {/* DIRECT FILE UPLOD BUTTON */}
                  <label className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                    {uploadingSetId === set.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-3.5 w-3.5" /> 📁 Upload Photo from Computer
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadPhotoToSet(set.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 min-h-[120px]">
                  {set.photos.map((pUrl, pIdx) => (
                    <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-slate-800 aspect-square">
                      <img src={pUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhotoFromSet(set.id, pIdx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {set.photos.length === 0 && (
                    <div className="col-span-3 py-6 text-center text-slate-500 text-xs">
                      No photos attached to this set. Click "📁 Upload Photo from Computer" to add images directly from your device!
                    </div>
                  )}
                </div>
              </div>

              {/* TEXT DESCRIPTION IN THIS SET */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" /> Set Text Message & Details
                </h4>
                <textarea
                  rows={5}
                  value={set.textDescription}
                  onChange={(e) => handleUpdateSet(set.id, 'textDescription', e.target.value)}
                  placeholder="Enter text details for this set..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white leading-relaxed font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Save Set-by-Set Sequence Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
