'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { createPage } from '@/lib/actions/page';
import { updateDatabaseViews } from '@/lib/actions/database';
import { Plus, Settings, Columns3, Filter, ArrowUpDown } from 'lucide-react';
import TableLayout from './TableLayout';
import KanbanBoard from './KanbanBoard';
import ViewsBar from './ViewsBar';
import DatabasePropertiesSidebar from './DatabasePropertiesSidebar';
import type {
  DatabaseView,
  TableViewConfig,
  KanbanViewConfig,
  ViewFilter,
  ViewSort,
} from '@/lib/types/views';

function uid() {
  return crypto.randomUUID().slice(0, 8);
}

function defaultTableView(name = 'Table'): DatabaseView {
  return {
    id: uid(),
    name,
    config: { type: 'table', columnOrder: [], hiddenColumns: [], filters: [], sorts: [] },
  };
}

function defaultKanbanView(schema: any[], name = 'Board'): DatabaseView {
  const firstSelect = schema.find((c: any) => c.type === 'select');
  return {
    id: uid(),
    name,
    config: {
      type: 'kanban',
      groupByCol: firstSelect?.id ?? '',
      groupOrder: [],
      filters: [],
      sorts: [],
    },
  };
}

function applyFilters(pages: any[], filters: ViewFilter[], schema: any[]): any[] {
  if (!filters.length) return pages;
  return pages.filter((page) =>
    filters.every((f) => {
      const raw = page.properties[f.columnId];
      const str =
        raw == null ? '' : Array.isArray(raw) ? raw.join(' ') : String(raw);
      switch (f.operator) {
        case 'equals':       return str === f.value;
        case 'not_equals':   return str !== f.value;
        case 'contains':     return str.toLowerCase().includes(f.value.toLowerCase());
        case 'not_contains': return !str.toLowerCase().includes(f.value.toLowerCase());
        case 'is_empty':     return !raw || str === '' || (Array.isArray(raw) && !raw.length);
        case 'is_not_empty': return !!raw && str !== '' && (!Array.isArray(raw) || raw.length > 0);
        default:             return true;
      }
    })
  );
}

function applySorts(pages: any[], sorts: ViewSort[]): any[] {
  if (!sorts.length) return pages;
  return [...pages].sort((a, b) => {
    for (const s of sorts) {
      const aV = a.properties[s.columnId];
      const bV = b.properties[s.columnId];
      const aStr = aV == null ? '' : String(aV);
      const bStr = bV == null ? '' : String(bV);
      const cmp = aStr.localeCompare(bStr, 'en');
      if (cmp !== 0) return s.direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

export default function DatabaseView({
  database,
  initialPages,
}: {
  database: any;
  initialPages: any[];
}) {
  const schema: any[] = database.schema ?? [];

  const [views, setViews] = useState<DatabaseView[]>(() => {
    const saved = database.views as DatabaseView[] | null | undefined;
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return [defaultTableView()];
  });

  const [activeViewId, setActiveViewId] = useState(() => views[0].id);
  const [isAdding, setIsAdding] = useState(false);

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'columns' | 'filters' | 'sorts'>('properties');

  const saveTimer = useRef<any>(null);

  const persistViews = useCallback(
    (next: DatabaseView[]) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateDatabaseViews(database.id, next);
      }, 400);
    },
    [database.id]
  );

  const mutateViews = useCallback(
    (fn: (vs: DatabaseView[]) => DatabaseView[]) => {
      setViews((prev) => {
        const next = fn(prev);
        persistViews(next);
        return next;
      });
    },
    [persistViews]
  );

  const activeView = views.find((v) => v.id === activeViewId) ?? views[0];
  const config = activeView.config;

  const mutateConfig = useCallback(
    (fn: (cfg: typeof config) => typeof config) => {
      mutateViews((vs) =>
        vs.map((v) =>
          v.id === activeView.id ? { ...v, config: fn(v.config) as any } : v
        )
      );
    },
    [mutateViews, activeView.id]
  );

  const processedPages = useMemo(
    () => applySorts(applyFilters(initialPages, config.filters, schema), config.sorts),
    [initialPages, config.filters, config.sorts, schema]
  );

  const handleAddRow = async () => {
    setIsAdding(true);
    await createPage(database.id, 'New Page');
    setIsAdding(false);
  };

  // --- View management ---
  const handleActivate = (id: string) => setActiveViewId(id);

  const handleAddView = (type: 'table' | 'kanban') => {
    const count = views.filter((v) => v.config.type === type).length;
    const base = type === 'table' ? 'Table' : 'Board';
    const name = count === 0 ? base : `${base} ${count + 1}`;
    const newView = type === 'table' ? defaultTableView(name) : defaultKanbanView(schema, name);
    mutateViews((vs) => [...vs, newView]);
    setActiveViewId(newView.id);
  };

  const handleRenameView = (id: string, name: string) => {
    mutateViews((vs) => vs.map((v) => (v.id === id ? { ...v, name } : v)));
  };

  const handleDeleteView = (id: string) => {
    mutateViews((vs) => {
      const next = vs.filter((v) => v.id !== id);
      if (activeViewId === id) setActiveViewId(next[0]?.id ?? '');
      return next;
    });
  };

  const handleReorderViews = (nextViews: DatabaseView[]) => {
    mutateViews(() => nextViews);
  };

  // --- Config mutations ---
  const handleFiltersChange = (filters: ViewFilter[]) =>
    mutateConfig((cfg) => ({ ...cfg, filters }));

  const handleSortsChange = (sorts: ViewSort[]) =>
    mutateConfig((cfg) => ({ ...cfg, sorts }));

  const handleColumnOrderChange = (columnOrder: string[]) =>
    mutateConfig((cfg) => ({ ...cfg, columnOrder }));

  const handleGroupByChange = (groupByCol: string) =>
    mutateConfig((cfg) => ({ ...cfg, groupByCol }));

  const handleGroupOrderChange = (groupOrder: string[]) =>
    mutateConfig((cfg) => ({ ...cfg, groupOrder }));

  const toggleHideColumn = (colId: string) => {
    const tc = config as TableViewConfig;
    const hidden = tc.hiddenColumns ?? [];
    const next = hidden.includes(colId)
      ? hidden.filter((c) => c !== colId)
      : [...hidden, colId];
    mutateConfig((cfg) => ({ ...cfg, hiddenColumns: next }));
  };

  const isTableView = config.type === 'table';
  const tableConfig = isTableView ? (config as TableViewConfig) : null;
  const kanbanConfig = !isTableView ? (config as KanbanViewConfig) : null;
  const selectColumns = schema.filter((c: any) => c.type === 'select');

  const handleToggleSidebar = (tab: typeof sidebarTab) => {
    if (sidebarOpen && sidebarTab === tab) {
      setSidebarOpen(false);
    } else {
      setSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  const handleHiddenColumnsChange = (nextHidden: string[]) => {
    mutateConfig((cfg) => ({ ...cfg, hiddenColumns: nextHidden }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-end justify-between border-b border-neutral-800">
        <ViewsBar
          views={views}
          activeViewId={activeView.id}
          onActivate={handleActivate}
          onAdd={handleAddView}
          onRename={handleRenameView}
          onDelete={handleDeleteView}
          onReorder={handleReorderViews}
        />

        <div className="flex items-center gap-0 pb-1.5">
          {/* Group by (kanban only) */}
          {!isTableView && kanbanConfig && selectColumns.length > 0 && (
            <div className="flex items-center gap-2 px-3">
              <span className="text-xs text-neutral-500">Group by</span>
              <select
                value={kanbanConfig.groupByCol}
                onChange={(e) => handleGroupByChange(e.target.value)}
                className="bg-transparent border border-neutral-800 text-xs text-neutral-300 px-2 py-1 outline-none hover:border-neutral-600 transition-colors cursor-pointer"
              >
                {selectColumns.map((col: any) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isTableView && kanbanConfig && selectColumns.length === 0 && (
            <span className="text-xs text-amber-500/80 px-3">
              Add a Select property to enable grouping
            </span>
          )}

          {/* Properties Button */}
          <button
            onClick={() => handleToggleSidebar('properties')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors cursor-pointer ${
              sidebarOpen
                ? 'text-blue-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <Settings size={14} /> Properties
          </button>

          {/* New Page button */}
          <button
            onClick={handleAddRow}
            disabled={isAdding}
            className="flex items-center gap-1.5 bg-neutral-100 text-neutral-900 hover:bg-white px-4 py-1.5 transition-colors text-sm font-medium disabled:opacity-50 ml-1 cursor-pointer"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Content + Sidebar Area */}
      <div className="flex-1 flex gap-4 min-h-0 relative pt-4">
        <div className="flex-1 min-h-0 overflow-hidden">
          {isTableView && tableConfig ? (
            <TableLayout
              database={database}
              pages={processedPages}
              columnOrder={tableConfig.columnOrder}
              hiddenColumns={tableConfig.hiddenColumns}
              onColumnOrderChange={handleColumnOrderChange}
            />
          ) : kanbanConfig ? (
            <KanbanBoard
              database={database}
              pages={processedPages}
              groupByCol={kanbanConfig.groupByCol}
              groupOrder={kanbanConfig.groupOrder}
              onGroupOrderChange={handleGroupOrderChange}
            />
          ) : null}
        </div>

        {/* Backdrop overlay for closing the sidebar when clicking outside */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-transparent z-20 cursor-default"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Panel Overlay */}
        {sidebarOpen && (
          <div className="absolute top-0 right-0 h-full z-30 shadow-2xl flex">
            <DatabasePropertiesSidebar
              database={database}
              activeView={activeView}
              activeTab={sidebarTab}
              setActiveTab={setSidebarTab}
              onClose={() => setSidebarOpen(false)}
              columnOrder={tableConfig?.columnOrder ?? []}
              hiddenColumns={tableConfig?.hiddenColumns ?? []}
              onToggleHideColumn={toggleHideColumn}
              onHiddenColumnsChange={handleHiddenColumnsChange}
              filters={config.filters}
              sorts={config.sorts}
              onFiltersChange={handleFiltersChange}
              onSortsChange={handleSortsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
