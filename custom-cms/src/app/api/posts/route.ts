import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';
import { PostSchema } from '@/lib/schemas';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const publishedOnly = request.nextUrl.searchParams.get('published') === 'true';
  const query = db.select().from(posts).orderBy(desc(posts.createdAt));
  const results = publishedOnly
    ? await query.where(eq(posts.published, true))
    : await query;
  return NextResponse.json(results, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const parsed = PostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, slug, content, author, tags, publishedAt, metaTitle, metaDescription, keywords, published } = parsed.data;
  const [created] = await db.insert(posts).values({
    title,
    slug,
    content: content ?? null,
    author: author ?? null,
    tags: tags ?? null,
    publishedAt: publishedAt ?? null,
    metaTitle: metaTitle ?? null,
    metaDescription: metaDescription ?? null,
    keywords: keywords ?? null,
    published: published ?? false,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
