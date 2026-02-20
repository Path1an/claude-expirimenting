'use client';
import Link from 'next/link';
import SortableList from '../_components/SortableList';

interface Post {
  id: number;
  title: string;
  author: string | null;
  published: boolean;
  createdAt: string;
  sortOrder: number;
}

export default function PostList({ initialPosts }: { initialPosts: Post[] }) {
  return (
    <SortableList
      initialItems={initialPosts}
      reorderUrl="/api/posts/reorder"
      colSpan={5}
      headers={<>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Author</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
        <th className="px-4 py-3"></th>
      </>}
      renderRow={(p) => <>
        <td className="px-4 py-3 font-medium text-zinc-100">{p.title}</td>
        <td className="px-4 py-3 text-zinc-500">{p.author ?? '—'}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
            {p.published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td className="px-4 py-3 text-zinc-500">{p.createdAt.slice(0, 10)}</td>
        <td className="px-4 py-3">
          <Link href={`/admin/posts/${p.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Edit</Link>
        </td>
      </>}
      emptyCell={<>No posts yet. <Link href="/admin/posts/new" className="text-indigo-400 hover:text-indigo-300">Create one →</Link></>}
    />
  );
}
