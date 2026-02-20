import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = { title: 'Blog' };

export default async function BlogListPage() {
  const allPosts = await db.select().from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return (
    <div>
      <div className="mb-12">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2 tracking-wide uppercase">Blog</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">All posts</h1>
      </div>

      {allPosts.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-20">No posts published yet.</p>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {allPosts.map((post) => (
          <article key={post.id} className="py-8 first:pt-0">
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    {post.author && <span>by {post.author}</span>}
                    {post.author && post.publishedAt && <span>·</span>}
                    {post.publishedAt && <span>{post.publishedAt.slice(0, 10)}</span>}
                  </div>
                  {post.tags && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {post.tags.split(',').map((t) => (
                        <span key={t} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-gray-200 dark:text-gray-700 group-hover:text-indigo-400 transition-colors text-xl shrink-0 mt-1">→</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
