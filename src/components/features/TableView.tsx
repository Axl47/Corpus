'use client';
import { useState } from 'react';
import { createPage } from '@/lib/actions/page';
import { Plus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TableView({ database, initialPages }: { database: any, initialPages: any[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRow = async () => {
    setIsAdding(true);
    const title = 'New Page';
    await createPage(database.id, title);
    setIsAdding(false);
  };

  const schema = database.schema as any[];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button 
          onClick={handleAddRow}
          disabled={isAdding}
          className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Plus size={16} /> New
        </button>
        <button className="flex items-center gap-2 text-neutral-400 hover:text-white px-3 py-2 rounded-md transition-colors text-sm">
          <Settings size={16} /> Properties
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="text-xs uppercase bg-neutral-800/80 text-neutral-400 border-b border-neutral-800">
              <tr>
                {schema.map((col) => (
                  <th key={col.id} className="px-6 py-3 font-medium whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialPages.length === 0 ? (
                <tr>
                  <td colSpan={schema.length} className="px-6 py-8 text-center text-neutral-500">
                    No pages found. Click "New" to create one.
                  </td>
                </tr>
              ) : (
                initialPages.map((page) => (
                  <tr 
                    key={page.id} 
                    onClick={() => router.push(`/db/${database.id}/${page.id}`)}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800 cursor-pointer transition-colors"
                  >
                    {schema.map((col) => {
                      const val = page.properties[col.id];
                      return (
                        <td key={col.id} className="px-6 py-3 whitespace-nowrap max-w-[200px] truncate">
                          {col.id === 'title' ? (
                            <span className="font-medium text-white">{val || 'Untitled'}</span>
                          ) : col.type === 'select' ? (
                            <span className="bg-neutral-700/50 border border-neutral-600 px-2.5 py-1 rounded-md text-xs">{val || '-'}</span>
                          ) : (
                            val || '-'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
