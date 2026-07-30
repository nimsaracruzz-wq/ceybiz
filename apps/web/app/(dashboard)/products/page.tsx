'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2, Edit2, Trash2 } from 'lucide-react';

interface Variant {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: { name: string };
  price: number;
  status: string;
  variants: { size: string; stock: number }[];
  images?: { url: string; isPrimary: boolean }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 10 },
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/products${search ? `?search=${search}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setPrice('');
    setImageUrl('');
    setDescription('');
    setVariants([
      { size: 'M', stock: 10 },
      { size: 'L', stock: 10 },
      { size: 'XL', stock: 10 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setPrice(p.price.toString());
    setImageUrl(p.images?.[0]?.url || '');
    setDescription(p.description || '');
    setVariants(p.variants.length > 0 ? p.variants : [{ size: 'M', stock: 10 }]);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:4000/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setToast({ type: 'success', message: 'Photo uploaded directly from computer!' });
      } else {
        setToast({ type: 'error', message: 'Failed to upload image file' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error uploading image' });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { size: 'S', stock: 5 }]);
  };

  const handleVariantChange = (index: number, field: 'size' | 'stock', value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    try {
      const url = editingProduct
        ? `http://localhost:4000/products/${editingProduct.id}`
        : 'http://localhost:4000/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku,
          description,
          price: parseFloat(price),
          imageUrl: imageUrl.trim() || undefined,
          variants,
        }),
      });

      if (res.ok) {
        setToast({
          type: 'success',
          message: editingProduct
            ? `Product "${name}" updated live!`
            : `Product "${name}" created live!`,
        });
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setToast({ type: 'error', message: 'Failed to save product details' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error saving product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete "${p.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:4000/products/${p.id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', message: `Product "${p.name}" deleted` });
        fetchProducts();
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to delete product' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950 border-red-500/50 text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-400" />
            Product Catalog & Live WhatsApp Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Updates to price, details, photos, or stock sync live with WhatsApp AI Assistant
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">Total: {products.length} Products</div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-950/50">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock & Variants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No products found. Click "Add Product" to create your first store product!
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                  const primaryImg = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {primaryImg ? (
                            <img src={primaryImg} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>

                      <td className="py-3.5 px-4 font-bold text-white">Rs. {p.price.toLocaleString()}</td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400">{totalStock} total in stock</span>
                          <div className="flex flex-wrap gap-1">
                            {p.variants.map((v, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-semibold text-slate-300 border border-slate-700">
                                {v.size}: {v.stock}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. White Oversized T-Shirt"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3500"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50 font-bold text-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">Product Image Photo</label>
                    <label className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1">
                      {uploadingFile ? 'Uploading...' : '📁 Upload File from Device'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or click Upload File"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Premium 240 GSM heavy cotton oversized fit t-shirt..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* VARIANTS & STOCK MANAGER */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                    Size Variants & Stock Quantities
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    + Add Size Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        placeholder="Size (e.g. M, L, XL)"
                        className="w-24 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-center font-bold"
                      />
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        className="w-24 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-center font-bold text-emerald-400"
                      />
                      <span className="text-[10px] text-slate-500">pcs</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 ml-auto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingProduct ? 'Save Live Updates' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
