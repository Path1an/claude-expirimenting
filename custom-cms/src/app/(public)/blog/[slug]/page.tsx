import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import sanitizeHtml from 'sanitize-html';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = db.select().from(posts).where(eq(posts.slug, slug)).get();
  if (!post) return { title: 'Not Found' };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? undefined,
    keywords: post.keywords ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = db.select().from(posts).where(eq(posts.slug, slug)).get();
  if (!post || !post.published) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-10">
        ← All posts
      </Link>

      {/* Header */}
      <header className="mb-10">
        {post.tags && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.tags.split(',').map((t) => (
              <span key={t} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
                {t.trim()}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-400 dark:text-gray-500">
          {post.author && <span>by {post.author}</span>}
          {post.author && post.publishedAt && <span>·</span>}
          {post.publishedAt && <span>{post.publishedAt.slice(0, 10)}</span>}
        </div>
      </header>

      {/* Body */}
      {post.content && (
        <div
          className="prose prose-gray dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content).replace(/\n/g, '<br/>') }}
        />
      )}
    </div>
  );
}
