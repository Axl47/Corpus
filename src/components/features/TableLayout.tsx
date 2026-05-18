'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GripHorizontal, Type, List, Hash, AlignLeft, Calendar, Clock, Tags } from 'lucide-react';

function getPropertyIcon(type: string) {
  switch (type) {
    case 'text':         return <Type size={11} className="text-neutral-600" />;
    case 'select':       return <List size={11} className="text-neutral-600" />;
    case 'multi_select': return <Tags size={11} className="text-neutral-600" />;
    case 'number':       return <Hash size={11} className="text-neutral-600" />;
    case 'date':         return <Calendar size={11} className="text-neutral-600" />;
    case 'datetime':     return <Clock size={11} className="text-neutral-600" />;
    default:             return <AlignLeft size={11} className="text-neutral-600" />;
  }
}

function formatDate(val: string) {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDatetime(val: string) {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
}

function getVisibleColumns(schema: any[], columnOrder: string[], hiddenColumns: string[]): any[] {
  const hiddenSet = new Set(hiddenColumns ?? []);
  const visible = schema.filter((c) => !hiddenSet.has(c.id));
  if (!columnOrder || columnOrder.length === 0) return visible;

  const orderIndex = new Map(columnOrder.map((id, i) => [id, i]));
  return [...visible].sort((a, b) => {
    const ai = orderIndex.has(a.id) ? orderIndex.get(a.id)! : Infinity;
    const bi = orderIndex.has(b.id) ? orderIndex.get(b.id)! : Infinity;
    return ai - bi;
  });
}

export default function TableLayout({
  database,
  pages,
  columnOrder,
  hiddenColumns,
  onColumnOrderChange,
}: {
  database: any;
  pages: any[];
  columnOrder: string[];
  hiddenColumns: string[];
  onColumnOrderChange: (order: string[]) => void;
}) {
  const router = useRouter();
  const schema: any[] = database.schema ?? [];

  const visibleCols = getVisibleColumns(schema, columnOrder, hiddenColumns);

  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, colId: string) => {
    setDraggedColId(colId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (draggedColId !== colId) setDragOverColId(colId);
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) setDragOverColId(null);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedColId || draggedColId === targetColId) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const fromIdx = visibleCols.findIndex((c) => c.id === draggedColId);
    const toIdx = visibleCols.findIndex((c) => c.id === targetColId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const newOrder = visibleCols.map((c) => c.id);
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, moved);
      onColumnOrderChange(newOrder);
    }

    setDraggedColId(null);
    setDragOverColId(null);
  };

  const handleDragEnd = () => {
    setDraggedColId(null);
    setDragOverColId(null);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead className="border-b border-neutral-800/60 sticky top-0 z-10">
          <tr>
            {visibleCols.map((col, idx) => {
              const isOver = dragOverColId === col.id;
              const isDraggingThis = draggedColId === col.id;
              const isFirst = idx === 0;
              const isLast = idx === visibleCols.length - 1;
              return (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col.id)}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={() => handleDragLeave(col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  onDragEnd={handleDragEnd}
                  className={`group py-2 font-medium whitespace-nowrap cursor-grab active:cursor-grabbing transition-colors w-48
                    ${isFirst ? 'pl-0 pr-3' : isLast ? 'pl-3 pr-0' : 'px-3'}
                    ${!isLast ? 'border-r border-neutral-800/40' : ''}
                    ${isOver ? 'border-l-2 border-l-blue-500/60' : ''}
                    ${isDraggingThis ? 'opacity-25' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {getPropertyIcon(col.type)}
                      <span className="truncate text-neutral-600 group-hover:text-neutral-400 text-xs uppercase tracking-wider transition-colors">
                        {col.name}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-40 text-neutral-600 cursor-grab transition-opacity pl-1">
                      <GripHorizontal size={11} />
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pages.length === 0 ? (
            <tr>
              <td
                colSpan={visibleCols.length}
                className="py-16 text-center text-neutral-600 text-sm"
              >
                No pages yet. Use "New" to get started.
              </td>
            </tr>
          ) : (
            pages.map((page) => (
              <tr
                key={page.id}
                onClick={() => router.push(`/db/${database.id}/${page.id}`)}
                className="border-b border-neutral-800/40 hover:bg-neutral-800/20 cursor-pointer transition-colors group"
              >
                {visibleCols.map((col, idx) => {
                  const val = page.properties[col.id];
                  const isFirst = idx === 0;
                  const isLast = idx === visibleCols.length - 1;
                  return (
                    <td
                      key={col.id}
                      className={`py-2 whitespace-nowrap overflow-hidden text-ellipsis
                        ${isFirst ? 'pl-0 pr-3' : isLast ? 'pl-3 pr-0' : 'px-3'}
                        ${!isLast ? 'border-r border-neutral-800/40' : ''}
                      `}
                    >
                      {col.id === 'title' ? (
                        <span className="font-medium text-neutral-200">{val || 'Untitled'}</span>
                      ) : col.type === 'select' ? (
                        <span className={`text-xs ${val ? 'text-neutral-400' : 'text-neutral-700'}`}>
                          {val || '—'}
                        </span>
                      ) : col.type === 'multi_select' ? (
                        <span className="flex flex-wrap gap-1">
                          {Array.isArray(val) && val.length > 0 ? (
                            val.map((opt: string) => (
                              <span
                                key={opt}
                                className="text-xs bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700/50"
                              >
                                {opt}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-700">—</span>
                          )}
                        </span>
                      ) : col.type === 'date' ? (
                        <span className="text-xs text-neutral-400">{val ? formatDate(val) : '—'}</span>
                      ) : col.type === 'datetime' ? (
                        <span className="text-xs text-neutral-400">
                          {val ? formatDatetime(val) : '—'}
                        </span>
                      ) : (
                        <span className="text-neutral-500">{val || ''}</span>
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
  );
}
