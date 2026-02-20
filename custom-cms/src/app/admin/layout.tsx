import Link from 'next/link';
import { getSession } from '@/lib/auth';
import SidebarNav from './SidebarNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <span className="font-semibold text-zinc-100 text-sm">CMS Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors mb-1"
          >
            <span>View site</span>
            <span className="text-xs">↗</span>
          </a>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0">
              {session.email[0].toUpperCase()}
            </div>
            <span className="text-xs text-zinc-400 truncate">{session.email}</span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-zinc-950">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
