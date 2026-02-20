'use client';
import Link from 'next/link';
import SortableList from '../_components/SortableList';

interface Page {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  sortOrder: number;
}

export default function PageList({ initialPages }: { initialPages: Page[] }) {
  return (
    <SortableList
      initialItems={initialPages}
      reorderUrl="/api/pages/reorder"
      colSpan={5}
      headers={<>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Slug</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
        <th className="px-4 py-3"></th>
      </>}
      renderRow={(p) => <>
        <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{p.title}</td>
        <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 font-mono text-xs">/{p.slug}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.published ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'}`}>
            {p.published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-400 dark:text-zinc-500">{p.createdAt.slice(0, 10)}</td>
        <td className="px-4 py-3">
          <Link href={`/admin/pages/${p.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm transition-colors">Edit</Link>
        </td>
      </>}
      emptyCell={<>No pages yet. <Link href="/admin/pages/new" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Create one →</Link></>}
    />
  );
}
