import { db } from '@/db';
import { products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

export const metadata = { title: 'Products' };

export default async function ProductsListPage() {
  const allProducts = await db.select().from(products)
    .where(eq(products.published, true))
    .orderBy(desc(products.createdAt));

  return (
    <div>
      <div className="mb-12">
        <p className="text-sm font-medium text-indigo-600 mb-2 tracking-wide uppercase">Shop</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">All products</h1>
      </div>

      {allProducts.length === 0 && (
        <p className="text-gray-400 text-center py-20">No products listed yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}
            className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="bg-gray-50 h-52 flex items-center justify-center text-gray-300 text-xs font-mono">
              no image
            </div>
            <div className="p-5">
              <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
              )}
              <p className="text-gray-900 font-bold text-lg mt-3">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
