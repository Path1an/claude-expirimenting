'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-zinc-300 mb-1.5';

interface Props { id?: string }

export default function ProductForm({ id }: Props) {
  const router = useRouter();
  const isNew = !id;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/products/${id}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          setName(data.name ?? '');
          setSlug(data.slug ?? '');
          setDescription(data.description ?? '');
          setPrice(String(data.price ?? ''));
          setMetaTitle(data.metaTitle ?? '');
          setMetaDescription(data.metaDescription ?? '');
          setKeywords(data.keywords ?? '');
          setPublished(data.published ?? false);
          setSlugTouched(true);
        })
        .catch(() => setError('Failed to load product'));
    }
  }, [id, isNew]);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function generateWithClaude() {
    if (!name) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/claude/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Write a product description for: ${name}`, context: 'product' }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDescription(data.content ?? '');
    } catch {
      setError('Failed to generate content');
    } finally {
      setAiLoading(false);
    }
  }

  async function generateSEO() {
    if (!description) return;
    setSeoLoading(true);
    try {
      const res = await fetch('/api/claude/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: description, contentType: 'product' }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMetaTitle(data.metaTitle ?? '');
      setMetaDescription(data.metaDescription ?? '');
      setKeywords(data.keywords ?? '');
    } catch {
      setError('Failed to generate SEO metadata');
    } finally {
      setSeoLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { name, slug, description, price: parseFloat(price), metaTitle, metaDescription, keywords, published };
      const res = isNew
        ? await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); if (isNew) router.push('/admin/products'); }
      else setError('Failed to save product');
    } catch {
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/products');
    else setError('Failed to delete product');
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{isNew ? 'New Product' : 'Edit Product'}</h1>
          {saved && <p className="text-emerald-400 text-sm mt-1">Saved ✓</p>}
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          {!isNew && <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>}
          <button onClick={() => router.push('/admin/products')} className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          <button form="product-form" type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} required className={inputCls} placeholder="Product name" />
            </div>
            <div>
              <label className={labelCls}>Price *</label>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required className={inputCls} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required className={inputCls} placeholder="product-slug" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className={labelCls + ' mb-0'}>Description</label>
            <button type="button" onClick={generateWithClaude} disabled={aiLoading || !name}
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors disabled:opacity-40">
              {aiLoading ? 'Generating…' : '✦ Generate with Claude'}
            </button>
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={12}
            className={inputCls + ' font-mono'} placeholder="Product description…" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">SEO</h3>
            <button type="button" onClick={generateSEO} disabled={seoLoading || !description}
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors disabled:opacity-40">
              {seoLoading ? 'Generating…' : '✦ Generate SEO'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Meta Title</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Keywords</label>
              <input value={keywords} onChange={e => setKeywords(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
            <div>
              <span className="text-sm font-medium text-zinc-300">Published</span>
              <p className="text-xs text-zinc-500 mt-0.5">Make this product visible in the store</p>
            </div>
          </label>
        </div>
      </form>
    </div>
  );
}
