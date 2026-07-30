'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  Volume2,
  UploadCloud,
  X,
  Sparkles,
  Tag,
  Eye,
  HardDrive,
  Grid,
  List,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  category: 'PRODUCT' | 'CAMPAIGN' | 'AUDIO' | 'DOCUMENT';
  tags: string[];
  createdAt: string;
}

const mockInitialAssets: MediaAsset[] = [
  {
    id: 'm1',
    filename: 'black-oversized-tshirt-front.jpg',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    mimeType: 'image/jpeg',
    sizeBytes: 1240000,
    category: 'PRODUCT',
    tags: ['black', 'tshirt', 'oversized', 'catalog'],
    createdAt: '2 hours ago',
  },
  {
    id: 'm2',
    filename: 'white-essential-tshirt.jpg',
    url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
    mimeType: 'image/jpeg',
    sizeBytes: 980000,
    category: 'PRODUCT',
    tags: ['white', 'essential', 'front'],
    createdAt: '1 day ago',
  },
  {
    id: 'm3',
    filename: 'avurudu-promo-banner-2026.png',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    mimeType: 'image/png',
    sizeBytes: 3450000,
    category: 'CAMPAIGN',
    tags: ['promo', 'discount', 'banner', 'whatsapp-broadcast'],
    createdAt: '3 days ago',
  },
  {
    id: 'm4',
    filename: 'maya-voice-greeting-sinhala.mp3',
    url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    mimeType: 'audio/mpeg',
    sizeBytes: 520000,
    category: 'AUDIO',
    tags: ['voice-note', 'welcome', 'sinhala'],
    createdAt: '5 days ago',
  },
  {
    id: 'm5',
    filename: 'store-returns-policy-doc.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1800000,
    category: 'DOCUMENT',
    tags: ['policy', 'returns', 'pdf'],
    createdAt: '1 week ago',
  },
];

const categoryLabels: Record<string, string> = {
  ALL: 'All Media',
  PRODUCT: 'Product Photos',
  CAMPAIGN: 'Campaign Banners',
  AUDIO: 'Voice Notes',
  DOCUMENT: 'Documents',
};

const categoryBadgeColors: Record<string, string> = {
  PRODUCT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CAMPAIGN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  AUDIO: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  DOCUMENT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(mockInitialAssets);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);

  // New Upload Form State
  const [newFilename, setNewFilename] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'PRODUCT' | 'CAMPAIGN' | 'AUDIO' | 'DOCUMENT'>('PRODUCT');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['whatsapp']);

  const fetchMedia = async () => {
    try {
      const res = await fetch('http://localhost:4000/media');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const mapped: MediaAsset[] = data.map((a: any) => ({
            id: a.id,
            filename: a.filename,
            url: a.url,
            mimeType: a.mimeType || 'image/jpeg',
            sizeBytes: Number(a.sizeBytes || 1000000),
            category: a.category || 'PRODUCT',
            tags: a.tags || ['media'],
            createdAt: new Date(a.createdAt).toLocaleDateString(),
          }));
          setAssets(mapped);
        }
      }
    } catch {
      //
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:4000/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAssets((prev) => [
          {
            id: data.asset.id,
            filename: data.filename,
            url: data.url,
            mimeType: file.type,
            sizeBytes: file.size,
            category: file.type.startsWith('image/') ? 'PRODUCT' : 'DOCUMENT',
            tags: ['uploaded', 'device'],
            createdAt: 'Just now',
          },
          ...prev,
        ]);
        setShowUploadModal(false);
      }
    } catch {
      //
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim().toLowerCase()]);
      setNewTagInput('');
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename || !newUrl) return;

    const newAsset: MediaAsset = {
      id: `m_${Date.now()}`,
      filename: newFilename,
      url: newUrl,
      mimeType: newUrl.includes('.png') ? 'image/png' : 'image/jpeg',
      sizeBytes: 1500000,
      category: newCategory,
      tags: newTags,
      createdAt: 'Just now',
    };

    setAssets([newAsset, ...assets]);
    setShowUploadModal(false);
    setNewFilename('');
    setNewUrl('');
    setNewTags(['whatsapp']);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchCategory = activeCategory === 'ALL' || asset.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const totalBytes = assets.reduce((sum, a) => sum + a.sizeBytes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-emerald-400" /> Media Asset Library
          </h1>
          <p className="text-xs text-slate-400">
            Tenant-isolated cloud storage for product photos, campaign media, and WhatsApp audio notes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <HardDrive className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Storage Used:</span>
            <span className="font-bold text-white">{formatSize(totalBytes)} / 5.0 GB</span>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          >
            <Plus className="h-4 w-4" /> Upload Media
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PRODUCT', 'CAMPAIGN', 'AUDIO', 'DOCUMENT'].map((cat) => {
              const count =
                cat === 'ALL' ? assets.length : assets.filter((a) => a.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{categoryLabels[cat]}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename or tag..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* MEDIA ASSET GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Asset Visual Preview */}
            <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
              {asset.mimeType.startsWith('image/') ? (
                <img
                  src={asset.url}
                  alt={asset.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : asset.category === 'AUDIO' ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Audio Track (.mp3)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Document (.pdf)</span>
                </div>
              )}

              {/* Category Pill */}
              <span
                className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                  categoryBadgeColors[asset.category]
                }`}
              >
                {asset.category}
              </span>
            </div>

            {/* Metadata Body */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white truncate" title={asset.filename}>
                  {asset.filename}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{formatSize(asset.sizeBytes)}</span>
                  <span>{asset.createdAt}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {asset.tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                <button
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center gap-1 transition-all"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy URL
                    </>
                  )}
                </button>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  title="View full"
                >
                  <Eye className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50"
                  title="Delete asset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <ImageIcon className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No media assets found</p>
          <p className="text-xs text-slate-500">Try adjusting your category filter or search query.</p>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-emerald-400" /> Add Media Asset
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              {/* Dropzone File Upload Input */}
              <label className="p-6 rounded-xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-slate-950/60 text-center space-y-2 block cursor-pointer transition-all">
                <UploadCloud className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-white">
                  {uploading ? 'Uploading File from Computer...' : '📁 Click to Select File from Computer'}
                </p>
                <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, MP3, PDF up to 25MB</p>
                <input
                  type="file"
                  onChange={handleDirectFileUpload}
                  className="hidden"
                />
              </label>

              {/* Filename */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Filename</label>
                <input
                  type="text"
                  required
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="e.g., promo-banner-summer.jpg"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Image / Asset URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="PRODUCT">Product Photos</option>
                  <option value="CAMPAIGN">Campaign Banners</option>
                  <option value="AUDIO">Voice & Audio Notes</option>
                  <option value="DOCUMENT">Documents & Policy PDFs</option>
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Asset Tags</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {newTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-[10px] font-mono flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => setNewTags(newTags.filter((x) => x !== t))}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  Save to Media Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
