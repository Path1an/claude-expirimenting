import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = db.select().from(posts).where(eq(posts.id, Number(id))).get();
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const [updated] = await db.update(posts)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(posts.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await db.delete(posts).where(eq(posts.id, Number(id)));
  return NextResponse.json({ ok: true });
}
