import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { apiTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';

interface Params { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(apiTokens).where(eq(apiTokens.id, Number(id)));
  return NextResponse.json({ ok: true });
}
