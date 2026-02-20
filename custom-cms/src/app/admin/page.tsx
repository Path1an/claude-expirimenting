import { db } from '@/db';
import { pages, posts, products, media } from '@/db/schema';
import { count, desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const [
    [{ pageCount }],
    [{ postCount }],
    [{ productCount }],
    [{ mediaCount }],
    recentPages,
    recentPosts,
    recentProducts,
  ] = await Promise.all([
    db.select({ pageCount: count() }).from(pages),
    db.select({ postCount: count() }).from(posts),
    db.select({ productCount: count() }).from(products),
    db.select({ mediaCount: count() }).from(media),
    db.select({ id: pages.id, title: pages.title, createdAt: pages.createdAt }).from(pages).orderBy(desc(pages.createdAt)).limit(5),
    db.select({ id: posts.id, title: posts.title, createdAt: posts.createdAt }).from(posts).orderBy(desc(posts.createdAt)).limit(5),
    db.select({ id: products.id, name: products.name, createdAt: products.createdAt }).from(products).orderBy(desc(products.createdAt)).limit(5),
  ]);

  const recentItems = [
    ...recentPages.map(p => ({ type: 'Page' as const, label: p.title, href: `/admin/pages/${p.id}`, createdAt: p.createdAt, badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' })),
    ...recentPosts.map(p => ({ type: 'Post' as const, label: p.title, href: `/admin/posts/${p.id}`, createdAt: p.createdAt, badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' })),
    ...recentProducts.map(p => ({ type: 'Product' as const, label: p.name, href: `/admin/products/${p.id}`, createdAt: p.createdAt, badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const stats = [
    { label: 'Pages', value: pageCount, href: '/admin/pages', icon: '□', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-l-blue-500' },
    { label: 'Blog Posts', value: postCount, href: '/admin/posts', icon: '≡', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-l-violet-500' },
    { label: 'Products', value: productCount, href: '/admin/products', icon: '◈', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500' },
    { label: 'Media Files', value: mediaCount, href: '/admin/media', icon: '⊡', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Overview of your content</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 border-l-2 ${s.border} rounded-xl p-5 hover:border-gray-300 dark:hover:border-zinc-700 hover:border-l-current transition-colors group`}
          >
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-lg ${s.color} mb-4`}>
              {s.icon}
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 dark:text-zinc-500 text-sm mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/pages/new" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm">New Page</div>
          <div className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Create a marketing page</div>
        </Link>
        <Link href="/admin/posts/new" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm">New Blog Post</div>
          <div className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Write a blog article</div>
        </Link>
        <Link href="/admin/products/new" className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-gray-900 dark:text-zinc-100 text-sm">New Product</div>
          <div className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Add a product listing</div>
        </Link>
      </div>

      {recentItems.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-4">Recent content</h2>
          <div className="space-y-1">
            {recentItems.map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.badge} shrink-0 w-16 text-center`}>
                  {item.type}
                </span>
                <span className="text-sm text-gray-700 dark:text-zinc-200 group-hover:text-gray-900 dark:group-hover:text-zinc-100 truncate flex-1">
                  {item.label}
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0">
                  {item.createdAt.slice(0, 10)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
