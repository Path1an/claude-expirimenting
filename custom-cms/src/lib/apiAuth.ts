import { db } from '@/db';
import { apiTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from './auth';
import { createHash } from 'crypto';

export async function isAuthenticated(request: Request): Promise<boolean> {
  // 1. Cookie session (admin UI)
  const session = await getSession();
  if (session) return true;

  // 2. Bearer token (headless API consumers)
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer cms_')) return false;

  const rawToken = authHeader.slice(7).trim();
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const row = db.select().from(apiTokens).where(eq(apiTokens.token, tokenHash)).get();
  if (!row) return false;

  // Update lastUsedAt (synchronous since better-sqlite3 is sync)
  db.update(apiTokens)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiTokens.id, row.id))
    .run();

  return true;
}
