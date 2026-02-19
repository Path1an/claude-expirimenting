import { db } from '@/db';
import { pages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function PagesListPage() {
  const allPages = await db.select().from(pages).orderBy(desc(pages.createdAt));

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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {allPages.map((page) => (
              <tr key={page.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-100">{page.title}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">/{page.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${page.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{page.createdAt.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${page.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Edit</Link>
                </td>
              </tr>
            ))}
            {allPages.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-600">No pages yet. <Link href="/admin/pages/new" className="text-indigo-400 hover:text-indigo-300">Create one →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
