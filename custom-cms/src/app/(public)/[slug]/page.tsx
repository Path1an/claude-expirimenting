import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import sanitizeHtml from 'sanitize-html';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = db.select().from(pages).where(eq(pages.slug, slug)).get();
  if (!page) return {};
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
    keywords: page.keywords ?? undefined,
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const page = db.select().from(pages).where(eq(pages.slug, slug)).get();
  if (!page || !page.published) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10">
        ← Home
      </Link>

      <article>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-8">{page.title}</h1>
        {page.content && (
          <div
            className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.replace(/\n/g, '<br/>')) }}
          />
        )}
      </article>
    </div>
  );
}
