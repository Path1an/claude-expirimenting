'use client';
import { useEffect, useState } from 'react';

export default function AdminThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors w-full"
      aria-label="Toggle dark mode"
    >
      <span>{isDark ? '☀' : '☾'}</span>
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
