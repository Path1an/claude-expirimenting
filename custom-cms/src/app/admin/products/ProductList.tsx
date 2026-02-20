'use client';
import Link from 'next/link';
import SortableList from '../_components/SortableList';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  published: boolean;
  sortOrder: number;
}

export default function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <SortableList
      initialItems={initialProducts}
      reorderUrl="/api/products/reorder"
      colSpan={5}
      headers={<>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Slug</th>
        <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
        <th className="px-4 py-3"></th>
      </>}
      renderRow={(p) => <>
        <td className="px-4 py-3 font-medium text-zinc-100">{p.name}</td>
        <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{p.slug}</td>
        <td className="px-4 py-3 text-right text-zinc-300">${p.price.toFixed(2)}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${p.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
            {p.published ? 'Published' : 'Draft'}
          </span>
        </td>
        <td className="px-4 py-3">
          <Link href={`/admin/products/${p.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Edit</Link>
        </td>
      </>}
      emptyCell={<>No products yet. <Link href="/admin/products/new" className="text-indigo-400 hover:text-indigo-300">Create one →</Link></>}
    />
  );
}
