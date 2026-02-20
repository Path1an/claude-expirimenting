import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages, media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/apiAuth';

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const images = db.select({ id: productImages.id, url: media.url, alt: media.alt, sortOrder: productImages.sortOrder })
    .from(productImages)
    .innerJoin(media, eq(productImages.mediaId, media.id))
    .where(eq(productImages.productId, Number(id)))
    .orderBy(productImages.sortOrder)
    .all();
  return NextResponse.json(images);
}

export async function POST(request: NextRequest, { params }: Params) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const productId = Number(id);

  const product = db.select({ id: products.id }).from(products).where(eq(products.id, productId)).get();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await request.json();
  const mediaId = Number(body.mediaId);
  if (!mediaId || isNaN(mediaId)) {
    return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
  }

  const mediaItem = db.select({ id: media.id }).from(media).where(eq(media.id, mediaId)).get();
  if (!mediaItem) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

  const [created] = await db.insert(productImages).values({ productId, mediaId }).returning();
  return NextResponse.json(created, { status: 201 });
}
