import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getDatabases } from '@/lib/actions/database';
import { Database, Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Clone',
  description: 'Customizable database and pages',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const databases = await getDatabases();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-950 text-neutral-50 flex h-screen overflow-hidden`}>
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-neutral-800">
            <Link href="/" className="font-semibold flex items-center gap-2 text-white hover:text-neutral-300 transition-colors">
              <Home size={18} /> Notion Clone
            </Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Databases</div>
            <ul className="space-y-1">
              {databases.map((db) => (
                <li key={db.id}>
                  <Link href={`/db/${db.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-800 text-sm text-neutral-300 hover:text-white transition-colors">
                    <Database size={16} />
                    {db.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
          {children}
        </main>
      </body>
    </html>
  );
}
