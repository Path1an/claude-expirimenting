import { db } from '@/db';
import { products, productImages, media } from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = { title: 'Products' };

export default async function ProductsListPage() {
  const allProducts = await db.select().from(products)
    .where(eq(products.published, true))
    .orderBy(asc(products.sortOrder), asc(products.id));

  const ids = allProducts.map(p => p.id);
  const firstImages = ids.length > 0
    ? db.select({ productId: productImages.productId, url: media.url, alt: media.alt })
        .from(productImages)
        .innerJoin(media, eq(productImages.mediaId, media.id))
        .where(inArray(productImages.productId, ids))
        .orderBy(productImages.productId, productImages.sortOrder)
        .all()
    : [];
  const imageMap = new Map<number, { url: string; alt: string | null }>();
  for (const img of firstImages) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, { url: img.url, alt: img.alt ?? null });
  }

  return (
    <div>
      <div className="mb-12">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2 tracking-wide uppercase">Shop</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">All products</h1>
      </div>

      {allProducts.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-20">No products listed yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}
            className="group block rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
            {imageMap.get(product.id) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageMap.get(product.id)!.url} alt={imageMap.get(product.id)!.alt ?? product.name}
                className="h-52 w-full object-cover" />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 h-52 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
            <div className="p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
              )}
              <p className="text-gray-900 dark:text-gray-100 font-bold text-lg mt-3">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
