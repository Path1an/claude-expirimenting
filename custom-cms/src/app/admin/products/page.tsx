import { db } from '@/db';
import { products } from '@/db/schema';
import { asc } from 'drizzle-orm';
import Link from 'next/link';
import ProductList from './ProductList';

export default async function ProductsListPage() {
  const allProducts = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));

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
      <ProductList initialProducts={allProducts} />
    </div>
  );
}
