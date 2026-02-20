import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';
import { unlink } from 'fs/promises';
import path from 'path';

interface Params { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const [deleted] = await db.delete(media).where(eq(media.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Remove file from disk (best-effort — don't fail the request if file is already gone)
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', deleted.storedName);
    await unlink(filePath);
  } catch {
    // file already missing — ignore
  }

  return NextResponse.json({ ok: true });
}
