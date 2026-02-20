import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages, media } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { getCorsHeaders } from '@/lib/cors';
import { ProductSchema } from '@/lib/schemas';
import { isAuthenticated } from '@/lib/apiAuth';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request.headers.get('origin')) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const authed = await isAuthenticated(request);
  const publishedOnly = !authed || request.nextUrl.searchParams.get('published') === 'true';
  const query = db.select().from(products).orderBy(desc(products.createdAt));
  const rows = publishedOnly
    ? await query.where(eq(products.published, true))
    : await query;

  // Attach first image for each product
  const ids = rows.map(p => p.id);
  const allImages = ids.length > 0
    ? db.select({ productId: productImages.productId, url: media.url, alt: media.alt })
        .from(productImages)
        .innerJoin(media, eq(productImages.mediaId, media.id))
        .where(inArray(productImages.productId, ids))
        .orderBy(productImages.productId, productImages.sortOrder)
        .all()
    : [];
  const firstImageMap = new Map<number, { url: string; alt: string | null }>();
  for (const img of allImages) {
    if (!firstImageMap.has(img.productId)) firstImageMap.set(img.productId, { url: img.url, alt: img.alt ?? null });
  }
  const results = rows.map(p => ({ ...p, image: firstImageMap.get(p.id) ?? null }));

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
