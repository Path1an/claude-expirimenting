import { db } from '@/db';
import { pages, posts, products, media } from '@/db/schema';
import { count } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const [[{ pageCount }], [{ postCount }], [{ productCount }], [{ mediaCount }]] = await Promise.all([
    db.select({ pageCount: count() }).from(pages),
    db.select({ postCount: count() }).from(posts),
    db.select({ productCount: count() }).from(products),
    db.select({ mediaCount: count() }).from(media),
  ]);

  const stats = [
    { label: 'Pages', value: pageCount, href: '/admin/pages', icon: '□', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Blog Posts', value: postCount, href: '/admin/posts', icon: '≡', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Products', value: productCount, href: '/admin/products', icon: '◈', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Media Files', value: mediaCount, href: '/admin/media', icon: '⊡', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Overview of your content</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center text-lg ${s.color} mb-4`}>
              {s.icon}
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/pages/new" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-zinc-100 text-sm">New Page</div>
          <div className="text-zinc-500 text-xs mt-1">Create a marketing page</div>
        </Link>
        <Link href="/admin/posts/new" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-zinc-100 text-sm">New Blog Post</div>
          <div className="text-zinc-500 text-xs mt-1">Write a blog article</div>
        </Link>
        <Link href="/admin/products/new" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
          <div className="text-2xl mb-3">+</div>
          <div className="font-medium text-zinc-100 text-sm">New Product</div>
          <div className="text-zinc-500 text-xs mt-1">Add a product listing</div>
        </Link>
      </div>
    </div>
  );
}
