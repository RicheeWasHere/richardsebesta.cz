import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Richard Šebesta - Portfolio',
  description: 'Software Engineer & Student | Portfolio of Richard Šebesta',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} className="dark !scroll-smooth">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-blue-500/30 selection:text-blue-200`}>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
