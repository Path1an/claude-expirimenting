import { db } from '@/db';
import { products } from '@/db/schema';
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

  return (
    <div>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10">
        ← All products
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Image */}
        <div className="bg-gray-50 rounded-3xl h-80 lg:h-96 flex items-center justify-center text-gray-300 text-xs font-mono border border-gray-100">
          no image
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-gray-900 mt-3">${product.price.toFixed(2)}</p>

          {product.description && (
            <p className="mt-5 text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}

          <div className="mt-8 flex gap-3">
            <button className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors">
              Add to cart
            </button>
            <button className="px-4 py-3 rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm">
              ♡
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
