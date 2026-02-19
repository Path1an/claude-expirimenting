import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom CMS',
  description: 'A custom CMS built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
