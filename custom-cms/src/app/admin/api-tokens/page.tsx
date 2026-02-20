import { db } from '@/db';
import { apiTokens } from '@/db/schema';
import { desc } from 'drizzle-orm';
import TokensClient from './TokensClient';

export default async function ApiTokensPage() {
  const rows = await db.select().from(apiTokens).orderBy(desc(apiTokens.createdAt));

  const tokens = rows.map(r => ({
    id: r.id,
    name: r.name,
    tokenMasked: 'cms_' + '•'.repeat(28) + (r.tokenHint ?? '????'),
    createdAt: r.createdAt,
    lastUsedAt: r.lastUsedAt,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">API Tokens</h1>
        <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Manage Bearer tokens for headless API access</p>
      </div>
      <TokensClient tokens={tokens} />
    </div>
  );
}
