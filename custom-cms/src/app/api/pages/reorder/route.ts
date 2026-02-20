import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { ids } = await request.json() as { ids: number[] };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
  }
  for (let i = 0; i < ids.length; i++) {
    await db.update(pages).set({ sortOrder: i }).where(eq(pages.id, ids[i]));
  }
  return NextResponse.json({ ok: true });
}
