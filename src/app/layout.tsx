import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lineage — Family Tree Explorer',
  description:
    'Visualize, explore, and understand your family heritage with Lineage — a beautiful, interactive family tree application.',
  keywords: ['family tree', 'genealogy', 'lineage', 'ancestry', 'family history'],
  openGraph: {
    title: 'Lineage — Family Tree Explorer',
    description: 'Interactive family tree with draggable nodes, spouse handling, and multi-lineage exploration.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
