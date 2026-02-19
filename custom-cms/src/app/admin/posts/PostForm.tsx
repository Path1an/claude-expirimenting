'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-zinc-300 mb-1.5';

interface Props { id?: string }

export default function PostForm({ id }: Props) {
  const router = useRouter();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/posts/${id}`).then(r => r.json()).then(data => {
        setTitle(data.title ?? '');
        setSlug(data.slug ?? '');
        setContent(data.content ?? '');
        setAuthor(data.author ?? '');
        setTags(data.tags ?? '');
        setPublishedAt(data.publishedAt?.slice(0, 16) ?? '');
        setMetaTitle(data.metaTitle ?? '');
        setMetaDescription(data.metaDescription ?? '');
        setKeywords(data.keywords ?? '');
        setPublished(data.published ?? false);
        setSlugTouched(true);
      });
    }
  }, [id, isNew]);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function generateWithClaude() {
    if (!title) return;
    setAiLoading(true);
    const res = await fetch('/api/claude/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Write a blog post titled: ${title}`, context: 'post' }) });
    const data = await res.json();
    setContent(data.content ?? '');
    setAiLoading(false);
  }

  async function generateSEO() {
    if (!content) return;
    setSeoLoading(true);
    const res = await fetch('/api/claude/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, contentType: 'post' }) });
    const data = await res.json();
    setMetaTitle(data.metaTitle ?? '');
    setMetaDescription(data.metaDescription ?? '');
    setKeywords(data.keywords ?? '');
    setSeoLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { title, slug, content, author, tags, publishedAt: publishedAt || null, metaTitle, metaDescription, keywords, published };
    const res = isNew
      ? await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch(`/api/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setLoading(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); if (isNew) router.push('/admin/posts'); }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    router.push('/admin/posts');
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{isNew ? 'New Post' : 'Edit Post'}</h1>
          {saved && <p className="text-emerald-400 text-sm mt-1">Saved ✓</p>}
        </div>
        <div className="flex items-center gap-3">
          {!isNew && <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm transition-colors">Delete</button>}
          <button onClick={() => router.push('/admin/posts')} className="border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
          <button form="post-form" type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <form id="post-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} required className={inputCls} placeholder="Post title" />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} required className={inputCls} placeholder="post-slug" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className={inputCls} placeholder="Author name" />
            </div>
            <div>
              <label className={labelCls}>Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className={inputCls} placeholder="tech, news, guide" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Publish Date</label>
            <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)}
              className={inputCls + ' w-auto'} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className={labelCls + ' mb-0'}>Content</label>
            <button type="button" onClick={generateWithClaude} disabled={aiLoading || !title}
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors disabled:opacity-40">
              {aiLoading ? 'Generating…' : '✦ Generate with Claude'}
            </button>
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={16}
            className={inputCls + ' font-mono'} placeholder="Write your post here (Markdown supported)…" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">SEO</h3>
            <button type="button" onClick={generateSEO} disabled={seoLoading || !content}
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
              <p className="text-xs text-zinc-500 mt-0.5">Make this post visible on the blog</p>
            </div>
          </label>
        </div>
      </form>
    </div>
  );
}
