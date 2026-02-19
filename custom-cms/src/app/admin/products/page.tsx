import { db } from '@/db';
import { products } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function ProductsListPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Products</h1>
          <p className="text-zinc-500 text-sm mt-1">{allProducts.length} product{allProducts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/products/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Product
        </Link>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Slug</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {allProducts.map((product) => (
              <tr key={product.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-100">{product.name}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{product.slug}</td>
                <td className="px-4 py-3 text-right text-zinc-300">${product.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${product.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">Edit</Link>
                </td>
              </tr>
            ))}
            {allProducts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-600">No products yet. <Link href="/admin/products/new" className="text-indigo-400 hover:text-indigo-300">Create one →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
