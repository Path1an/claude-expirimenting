import { db } from '@/db';
import { pages, posts, products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function HomePage() {
  const [recentPages, recentPosts, recentProducts] = await Promise.all([
    db.select().from(pages).where(eq(pages.published, true)).orderBy(desc(pages.createdAt)).limit(3),
    db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt)).limit(3),
    db.select().from(products).where(eq(products.published, true)).orderBy(desc(products.createdAt)).limit(4),
  ]);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="pt-8 pb-4">
        <p className="text-sm font-medium text-indigo-600 mb-3 tracking-wide uppercase">Welcome</p>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight max-w-2xl">
          Ideas, stories, and products worth exploring.
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl">
          A home for our latest writing, releases, and everything in between.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/blog" className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
            Read the blog
          </Link>
          <Link href="/products" className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:border-gray-400 transition-colors">
            Browse products
          </Link>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Latest posts</h2>
            <Link href="/blog" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              All posts →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group block p-5 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all">
                <p className="text-xs text-gray-400 mb-2">
                  {post.publishedAt ? post.publishedAt.slice(0, 10) : post.createdAt.slice(0, 10)}
                </p>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.author && <p className="text-sm text-gray-400 mt-2">by {post.author}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {recentProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Featured products</h2>
            <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              All products →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}
                className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="bg-gray-50 h-40 flex items-center justify-center text-gray-300 text-xs font-mono">
                  no image
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-gray-900 font-bold mt-1">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pages */}
      {recentPages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pages</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recentPages.map((page) => (
              <Link key={page.id} href={`/${page.slug}`}
                className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all">
                <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">
                  {page.title}
                </span>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
