import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
            My Site
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Products</Link>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-24">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-gray-900">My Site</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
            <Link href="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          </div>
          <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} My Site</span>
        </div>
      </footer>
    </div>
  );
}
