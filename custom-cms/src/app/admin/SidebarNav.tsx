'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    label: 'Content',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '▦', exact: true },
      { href: '/admin/pages', label: 'Pages', icon: '□' },
      { href: '/admin/posts', label: 'Blog Posts', icon: '≡' },
      { href: '/admin/products', label: 'Products', icon: '◈' },
      { href: '/admin/media', label: 'Media', icon: '⊡' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/admin/settings', label: 'Site Settings', icon: '⚙' },
      { href: '/admin/api-tokens', label: 'API Tokens', icon: '⬡' },
    ],
  },
  {
    label: 'Developer',
    items: [
      { href: '/admin/api-reference', label: 'API Reference', icon: '⟨⟩' },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {sections.map(({ label, items }) => (
        <div key={label}>
          <p className="px-3 mb-1 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            {label}
          </p>
          <div className="space-y-0.5">
            {items.map(({ href, label: itemLabel, icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  <span className="text-base w-5 text-center shrink-0">{icon}</span>
                  {itemLabel}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
