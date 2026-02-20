import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productImages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';

interface Params { params: Promise<{ id: string; imageId: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { imageId } = await params;
  const [deleted] = await db.delete(productImages).where(eq(productImages.id, Number(imageId))).returning();
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
