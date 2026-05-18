'use client';
import { useState, useEffect } from 'react';
import { updatePageContent, updatePageProperties } from '@/lib/actions/page';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PageEditor({ database, initialPage }: { database: any, initialPage: any }) {
  const [content, setContent] = useState(initialPage.content || '');
  const [properties, setProperties] = useState<Record<string, any>>(initialPage.properties || {});
  
  const schema = database.schema as any[];

  // Simple auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== initialPage.content) {
        updatePageContent(initialPage.id, content);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, initialPage.id, initialPage.content]);

  const handlePropertyChange = async (colId: string, value: string) => {
    const newProps = { ...properties, [colId]: value };
    setProperties(newProps);
    await updatePageProperties(initialPage.id, newProps);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <Link href={`/db/${database.id}`} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-10 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to {database.name}
      </Link>

      {/* Properties Section */}
      <div className="mb-12 space-y-4">
        {schema.map((col) => (
          <div key={col.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-neutral-800/60 pb-3 group">
            <div className="text-neutral-500 w-32 shrink-0 text-sm font-medium group-hover:text-neutral-400 transition-colors">{col.name}</div>
            
            {col.type === 'select' ? (
              <select
                value={properties[col.id] || ''}
                onChange={(e) => handlePropertyChange(col.id, e.target.value)}
                className="bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-neutral-700 rounded p-1 -ml-1 flex-1 max-w-xs text-sm transition-shadow"
              >
                <option value="" className="bg-neutral-900">Empty</option>
                {col.options?.map((opt: string) => (
                  <option key={opt} value={opt} className="bg-neutral-900">{opt}</option>
                ))}
              </select>
            ) : col.id === 'title' ? (
              <input
                type="text"
                value={properties[col.id] || ''}
                onChange={(e) => handlePropertyChange(col.id, e.target.value)}
                placeholder="Untitled"
                className="bg-transparent text-white focus:outline-none rounded p-1 -ml-1 font-bold text-4xl flex-1 placeholder:text-neutral-800 tracking-tight"
              />
            ) : (
              <input
                type="text"
                value={properties[col.id] || ''}
                onChange={(e) => handlePropertyChange(col.id, e.target.value)}
                placeholder="Empty"
                className="bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-neutral-700 rounded p-1 -ml-1 flex-1 text-sm placeholder:text-neutral-700 transition-shadow"
              />
            )}
          </div>
        ))}
      </div>

      {/* Markdown Content Section */}
      <div className="relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Press '/' for commands or type markdown..."
          className="w-full min-h-[500px] bg-transparent text-neutral-300 focus:outline-none resize-none prose prose-invert max-w-none text-base leading-loose placeholder:text-neutral-700"
        />
      </div>
    </div>
  );
}
