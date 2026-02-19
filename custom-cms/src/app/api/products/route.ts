import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, type NewProduct } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';

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
  const body = await request.json() as Partial<NewProduct>;
  if (!body.name || !body.slug || body.price == null) {
    return NextResponse.json({ error: 'name, slug and price are required' }, { status: 400 });
  }
  const [created] = await db.insert(products).values({
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    price: body.price,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
    keywords: body.keywords ?? null,
    published: body.published ?? false,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
