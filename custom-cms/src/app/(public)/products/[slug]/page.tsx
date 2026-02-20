import { db } from '@/db';
import { products, productImages, media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ImageGallery from './ImageGallery';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? undefined,
    keywords: product.keywords ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product || !product.published) notFound();

  const images = db.select({ url: media.url, alt: media.alt })
    .from(productImages)
    .innerJoin(media, eq(productImages.mediaId, media.id))
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.sortOrder)
    .all();

  return (
    <div>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-10">
        ← All products
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <ImageGallery images={images} productName={product.name} />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl h-80 lg:h-96 flex items-center justify-center border border-gray-100 dark:border-gray-800">
              <svg className="w-16 h-16 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-3">${product.price.toFixed(2)}</p>

          {product.description && (
            <p className="mt-5 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}

          <div className="mt-8 flex gap-3">
            <button className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors">
              Add to cart
            </button>
            <button className="px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm">
              ♡
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
