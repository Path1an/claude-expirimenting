'use client';
import { useState } from 'react';
import type { SiteSettings } from '@/db/schema';
import { API } from '@/lib/api-paths';

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-zinc-300 mb-1.5';

interface Props {
  settings: Partial<SiteSettings>;
}

export default function SettingsForm({ settings }: Props) {
  const socials = (() => {
    try { return settings.socialLinks ? JSON.parse(settings.socialLinks) : {}; } catch { return {}; }
  })();
  const corsArr = (() => {
    try { return settings.corsOrigins ? JSON.parse(settings.corsOrigins) : []; } catch { return []; }
  })();

  const [siteName, setSiteName] = useState(settings.siteName ?? '');
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription ?? '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? '');
  const [twitter, setTwitter] = useState(socials.twitter ?? '');
  const [github, setGithub] = useState(socials.github ?? '');
  const [linkedin, setLinkedin] = useState(socials.linkedin ?? '');
  const [corsOrigins, setCorsOrigins] = useState(corsArr.join('\n'));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const origins = corsOrigins.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const res = await fetch(API.settings, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName,
        siteDescription: siteDescription || null,
        logoUrl: logoUrl || null,
        socialLinks: { twitter: twitter || undefined, github: github || undefined, linkedin: linkedin || undefined },
        corsOrigins: origins,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setToast('Settings saved');
      setTimeout(() => setToast(''), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {toast && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg px-4 py-3">
          {toast} ✓
        </div>
      )}

      {/* General */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">General</h2>
        <div>
          <label className={labelCls}>Site Name *</label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} required className={inputCls} placeholder="My Awesome Site" />
        </div>
        <div>
          <label className={labelCls}>Site Description</label>
          <textarea value={siteDescription} onChange={e => setSiteDescription(e.target.value)} rows={2} className={inputCls} placeholder="A short description of your site" />
        </div>
        <div>
          <label className={labelCls}>Logo URL</label>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className={inputCls} placeholder="https://example.com/logo.png" />
          {logoUrl && <img src={logoUrl} alt="Logo preview" className="mt-2 h-10 object-contain rounded" />}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">Social Links</h2>
        <div>
          <label className={labelCls}>Twitter / X</label>
          <input value={twitter} onChange={e => setTwitter(e.target.value)} className={inputCls} placeholder="https://twitter.com/yourhandle" />
        </div>
        <div>
          <label className={labelCls}>GitHub</label>
          <input value={github} onChange={e => setGithub(e.target.value)} className={inputCls} placeholder="https://github.com/yourorg" />
        </div>
        <div>
          <label className={labelCls}>LinkedIn</label>
          <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className={inputCls} placeholder="https://linkedin.com/company/..." />
        </div>
      </div>

      {/* CORS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-100 mb-1">CORS Allowed Origins</h2>
        <p className="text-xs text-zinc-500 mb-4">Enter one origin per line. These origins can call your API from a browser (e.g. your frontend app).</p>
        <textarea
          value={corsOrigins}
          onChange={e => setCorsOrigins(e.target.value)}
          rows={4}
          className={inputCls + ' font-mono'}
          placeholder={'https://myapp.com\nhttps://staging.myapp.com'}
        />
        <p className="text-xs text-zinc-600 mt-2">Changes take effect within 60 seconds.</p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
