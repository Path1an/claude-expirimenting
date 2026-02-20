'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api-paths';

export const inputCls = 'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
export const labelCls = 'block text-sm font-medium text-zinc-300 mb-1.5';

type SetExtra = (key: string, value: string) => void;

export interface FormCtx {
  extra: Record<string, string>;
  setExtra: SetExtra;
  inputCls: string;
  labelCls: string;
}

export interface FormConfig {
  label: string;
  formId: string;
  apiBase: string;
  listPath: string;
  contentType: 'page' | 'post' | 'product';
  primaryField: { key: string; label: string; placeholder: string };
  contentField: { key: string; label: string; placeholder: string; rows: number };
  claudePromptPrefix: string;
  publishedHelp: string;
  extraFields?:  (ctx: FormCtx) => React.ReactNode;
  extraPayload?: (extra: Record<string, string>) => Record<string, unknown>;
  hydrateExtra?: (data: Record<string, unknown>, setExtra: SetExtra) => void;
}

export default function ContentForm({ id, config }: { id?: string; config: FormConfig }) {
  const router = useRouter();
  const isNew = !id;

  const [primaryValue, setPrimaryValue] = useState('');
  const [slug, setSlug] = useState('');
  const [contentValue, setContentValue] = useState('');
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
  const [extra, setExtraState] = useState<Record<string, string>>({});

  const setExtra: SetExtra = (key, value) =>
    setExtraState(prev => ({ ...prev, [key]: value }));

  const ctx: FormCtx = { extra, setExtra, inputCls, labelCls };

  useEffect(() => {
    if (!isNew) {
      fetch(`${config.apiBase}/${id}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          setPrimaryValue(data[config.primaryField.key] ?? '');
          setSlug(data.slug ?? '');
          setContentValue(data[config.contentField.key] ?? '');
          setMetaTitle(data.metaTitle ?? '');
          setMetaDescription(data.metaDescription ?? '');
          setKeywords(data.keywords ?? '');
          setPublished(data.published ?? false);
          setSlugTouched(true);
          config.hydrateExtra?.(data, setExtra);
        })
        .catch(() => setError(`Failed to load ${config.label.toLowerCase()}`));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  function handlePrimaryChange(v: string) {
    setPrimaryValue(v);
    if (!slugTouched) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function generateWithClaude() {
    if (!primaryValue) return;
    setAiLoading(true);
    try {
      const res = await fetch(API.claudeGenerate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${config.claudePromptPrefix} ${primaryValue}`, context: config.contentType }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContentValue(data.content ?? '');
    } catch {
      setError('Failed to generate content');
    } finally {
      setAiLoading(false);
    }
  }

  async function generateSEO() {
    if (!contentValue) return;
    setSeoLoading(true);
    try {
      const res = await fetch(API.claudeSeo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentValue, contentType: config.contentType }),
      });
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
      const payload = {
        [config.primaryField.key]: primaryValue,
        slug,
        [config.contentField.key]: contentValue,
        metaTitle,
        metaDescription,
        keywords,
        published,
        ...config.extraPayload?.(extra),
      };
      const res = isNew
        ? await fetch(config.apiBase, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`${config.apiBase}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (isNew) router.push(config.listPath);
      } else {
        setError(`Failed to save ${config.label.toLowerCase()}`);
      }
    } catch {
      setError(`Failed to save ${config.label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete this ${config.label.toLowerCase()}?`)) return;
    const res = await fetch(`${config.apiBase}/${id}`, { method: 'DELETE' });
    if (res.ok) router.push(config.listPath);
    else setError(`Failed to delete ${config.label.toLowerCase()}`);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{isNew ? `New ${config.label}` : `Edit ${config.label}`}</h1>
          {saved && <p className="text-emerald-400 text-sm mt-1">Saved ✓</p>}
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          {!isNew && <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>}
          <button onClick={() => router.push(config.listPath)} className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          <button form={config.formId} type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <form id={config.formId} onSubmit={handleSubmit} className="space-y-5">
        {/* Core fields */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <label className={labelCls}>{config.primaryField.label} *</label>
            <input value={primaryValue} onChange={e => handlePrimaryChange(e.target.value)} required className={inputCls} placeholder={config.primaryField.placeholder} />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required className={inputCls} placeholder="url-slug" />
          </div>
          {config.extraFields?.(ctx)}
        </div>

        {/* Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className={labelCls + ' mb-0'}>{config.contentField.label}</label>
            <button type="button" onClick={generateWithClaude} disabled={aiLoading || !primaryValue}
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors disabled:opacity-40">
              {aiLoading ? 'Generating…' : '✦ Generate with Claude'}
            </button>
          </div>
          <textarea value={contentValue} onChange={e => setContentValue(e.target.value)} rows={config.contentField.rows}
            className={inputCls + ' font-mono'} placeholder={config.contentField.placeholder} />
        </div>

        {/* SEO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">SEO</h3>
            <button type="button" onClick={generateSEO} disabled={seoLoading || !contentValue}
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors disabled:opacity-40">
              {seoLoading ? 'Generating…' : '✦ Generate SEO'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Meta Title</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className={inputCls} placeholder="SEO title" />
            </div>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} className={inputCls} placeholder="SEO description" />
            </div>
            <div>
              <label className={labelCls}>Keywords</label>
              <input value={keywords} onChange={e => setKeywords(e.target.value)} className={inputCls} placeholder="keyword1, keyword2" />
            </div>
          </div>
        </div>

        {/* Published */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            <div>
              <span className="text-sm font-medium text-zinc-300">Published</span>
              <p className="text-xs text-zinc-500 mt-0.5">{config.publishedHelp}</p>
            </div>
          </label>
        </div>
      </form>
    </div>
  );
}
