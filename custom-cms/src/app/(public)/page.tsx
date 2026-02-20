import { db } from '@/db';
import { pages, posts, products, productImages, media } from '@/db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import Link from 'next/link';

export default async function HomePage() {
  const [recentPages, recentPosts, recentProducts] = await Promise.all([
    db.select().from(pages).where(eq(pages.published, true)).orderBy(asc(pages.sortOrder), asc(pages.id)).limit(3),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(asc(posts.sortOrder), asc(posts.id)).limit(3),
    db.select().from(products).where(eq(products.published, true)).orderBy(asc(products.sortOrder), asc(products.id)).limit(4),
  ]);

  const productIds = recentProducts.map(p => p.id);
  const firstImages = productIds.length > 0
    ? db.select({ productId: productImages.productId, url: media.url, alt: media.alt })
        .from(productImages)
        .innerJoin(media, eq(productImages.mediaId, media.id))
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.productId, productImages.sortOrder)
        .all()
    : [];
  const imageMap = new Map<number, { url: string; alt: string | null }>();
  for (const img of firstImages) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, { url: img.url, alt: img.alt ?? null });
  }

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="pt-8 pb-4 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-20 -right-32 w-80 h-80 rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3 tracking-wide uppercase">Welcome</p>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight max-w-2xl">
          Ideas, stories, and products worth exploring.
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl">
          A home for our latest writing, releases, and everything in between.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/blog" className="inline-flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors">
            Read the blog
          </Link>
          <Link href="/products" className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            Browse products
          </Link>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Latest posts</h2>
            <Link href="/blog" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              All posts →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group block p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                  {post.publishedAt ? post.publishedAt.slice(0, 10) : post.createdAt.slice(0, 10)}
                </p>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.author && <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">by {post.author}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {recentProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Featured products</h2>
            <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              All products →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}
                className="group block rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
                {imageMap.get(product.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageMap.get(product.id)!.url} alt={imageMap.get(product.id)!.alt ?? product.name}
                    className="h-40 w-full object-cover" />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 h-40 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 font-bold mt-1">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pages */}
      {recentPages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Pages</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recentPages.map((page) => (
              <Link key={page.id} href={`/${page.slug}`}
                className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
                <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                  {page.title}
                </span>
                <span className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
