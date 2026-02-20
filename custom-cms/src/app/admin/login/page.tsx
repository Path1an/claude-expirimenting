'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/admin';
    } else {
      const data = await res.json();
      setError(data.error ?? 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
            C
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 text-center mb-1">Welcome back</h1>
        <p className="text-gray-400 dark:text-zinc-500 text-sm text-center mb-8">Sign in to your CMS dashboard</p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-zinc-600 mt-6">Custom CMS — built with Next.js</p>
      </div>
    </div>
  );
}
