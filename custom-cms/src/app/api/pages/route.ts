import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';
import { PageSchema } from '@/lib/schemas';
import { isAuthenticated } from '@/lib/apiAuth';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const authed = await isAuthenticated(request);
  const publishedOnly = !authed || request.nextUrl.searchParams.get('published') === 'true';
  const query = db.select().from(pages).orderBy(desc(pages.createdAt));
  const results = publishedOnly
    ? await query.where(eq(pages.published, true))
    : await query;
  return NextResponse.json(results, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const parsed = PageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, slug, content, metaTitle, metaDescription, keywords, published } = parsed.data;
  const [created] = await db.insert(pages).values({
    title,
    slug,
    content: content ?? null,
    metaTitle: metaTitle ?? null,
    metaDescription: metaDescription ?? null,
    keywords: keywords ?? null,
    published: published ?? false,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
