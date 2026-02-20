import { db } from '@/db';
import { pages } from '@/db/schema';
import { asc } from 'drizzle-orm';
import Link from 'next/link';
import PageList from './PageList';

export default async function PagesListPage() {
  const allPages = await db.select().from(pages).orderBy(asc(pages.sortOrder), asc(pages.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Pages</h1>
          <p className="text-zinc-500 text-sm mt-1">{allPages.length} page{allPages.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/pages/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Page
        </Link>
      </div>
      <PageList initialPages={allPages} />
    </div>
  );
}
