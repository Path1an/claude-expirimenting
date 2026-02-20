import { db } from '@/db';
import { products, productImages, media } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

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
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0].url} alt={images[0].alt ?? product.name}
                className="w-full rounded-3xl object-cover h-80 lg:h-96 border border-gray-100 dark:border-gray-800" />
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.slice(1).map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img.url} alt={img.alt ?? product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-800 flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl h-80 lg:h-96 flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs font-mono border border-gray-100 dark:border-gray-800">
              no image
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
