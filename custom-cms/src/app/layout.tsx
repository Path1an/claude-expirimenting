import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom CMS',
  description: 'A custom CMS built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('theme');if(s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
