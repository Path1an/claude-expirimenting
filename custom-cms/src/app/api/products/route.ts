import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';
import { ProductSchema } from '@/lib/schemas';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const publishedOnly = request.nextUrl.searchParams.get('published') === 'true';
  const query = db.select().from(products).orderBy(desc(products.createdAt));
  const results = publishedOnly
    ? await query.where(eq(products.published, true))
    : await query;
  return NextResponse.json(results, { headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const parsed = ProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, slug, description, price, metaTitle, metaDescription, keywords, published } = parsed.data;
  const [created] = await db.insert(products).values({
    name,
    slug,
    description: description ?? null,
    price,
    metaTitle: metaTitle ?? null,
    metaDescription: metaDescription ?? null,
    keywords: keywords ?? null,
    published: published ?? false,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
