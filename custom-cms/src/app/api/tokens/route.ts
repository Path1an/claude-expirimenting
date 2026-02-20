import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiTokens } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';
import { randomBytes, createHash } from 'crypto';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tokens = await db.select().from(apiTokens).orderBy(desc(apiTokens.createdAt));
  return NextResponse.json(tokens.map(t => ({
    id: t.id,
    name: t.name,
    tokenMasked: `cms_${'*'.repeat(28)}${t.tokenHint ?? '????'}`,
    createdAt: t.createdAt,
    lastUsedAt: t.lastUsedAt,
  })));
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const rawToken = `cms_${randomBytes(16).toString('hex')}`;
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  const tokenHint = rawToken.slice(-4);
  const [created] = await db.insert(apiTokens).values({
    name: body.name.trim(),
    token: tokenHash,
    tokenHint,
  }).returning();

  return NextResponse.json({
    id: created.id,
    name: created.name,
    fullToken: rawToken,
    tokenMasked: `cms_${'*'.repeat(28)}${tokenHint}`,
    createdAt: created.createdAt,
    lastUsedAt: null,
  }, { status: 201 });
}
