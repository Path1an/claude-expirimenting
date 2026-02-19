'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Token {
  id: number;
  name: string;
  tokenMasked: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface Props { tokens: Token[] }

export default function TokensClient({ tokens }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<{ name: string; fullToken: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setNewToken({ name: data.name, fullToken: data.fullToken });
      setName('');
      setShowForm(false);
      router.refresh();
    }
  }

  async function handleDelete(id: number, tokenName: string) {
    if (!confirm(`Revoke token "${tokenName}"? This cannot be undone.`)) return;
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  function copyToken() {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken.fullToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* New token banner */}
      {newToken && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-amber-300 font-semibold text-sm">Token created: {newToken.name}</p>
              <p className="text-amber-400/70 text-xs mt-0.5">Copy this token now — it will not be shown again.</p>
            </div>
            <button onClick={() => setNewToken(null)} className="text-amber-400/50 hover:text-amber-400 text-lg leading-none">×</button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <code className="flex-1 bg-zinc-950 text-amber-300 rounded-lg px-3 py-2 text-sm font-mono break-all">
              {newToken.fullToken}
            </code>
            <button onClick={copyToken} className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-2 rounded-lg text-sm transition-colors">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-100">API Tokens</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            + Create Token
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="flex gap-3 mb-4 pb-4 border-b border-zinc-800">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Token name (e.g. My Frontend App)"
              required
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left pb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="text-left pb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Token</th>
              <th className="text-left pb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
              <th className="text-left pb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last used</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} className="border-b border-zinc-800 last:border-0">
                <td className="py-3 font-medium text-zinc-100">{t.name}</td>
                <td className="py-3 font-mono text-xs text-zinc-500">{t.tokenMasked}</td>
                <td className="py-3 text-zinc-500">{t.createdAt.slice(0, 10)}</td>
                <td className="py-3 text-zinc-500">{t.lastUsedAt ? t.lastUsedAt.slice(0, 10) : <span className="text-zinc-700">Never</span>}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDelete(t.id, t.name)} className="text-red-400 hover:text-red-300 text-sm transition-colors">Revoke</button>
                </td>
              </tr>
            ))}
            {tokens.length === 0 && !showForm && (
              <tr><td colSpan={5} className="py-10 text-center text-zinc-600 text-sm">No tokens yet. Create one to start using the headless API.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Usage instructions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-100 mb-3">How to use</h2>
        <p className="text-sm text-zinc-400 mb-3">Include the token as a Bearer header on any API request:</p>
        <pre className="bg-zinc-950 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto">{`curl https://your-cms.com/api/pages \\
  -H "Authorization: Bearer cms_your_token_here"`}</pre>
        <p className="text-xs text-zinc-600 mt-3">Public GET endpoints (pages, posts, products, media, settings) work without a token.</p>
      </div>
    </div>
  );
}
