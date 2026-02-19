import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pages, type NewPage } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const publishedOnly = request.nextUrl.searchParams.get('published') === 'true';
  const query = db.select().from(pages).orderBy(desc(pages.createdAt));
  const results = publishedOnly
    ? await query.where(eq(pages.published, true))
    : await query;
  return NextResponse.json(results, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Partial<NewPage>;
  if (!body.title || !body.slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }
  const [created] = await db.insert(pages).values({
    title: body.title,
    slug: body.slug,
    content: body.content ?? null,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
    keywords: body.keywords ?? null,
    published: body.published ?? false,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
