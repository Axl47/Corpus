const COLS = [
  {
    name: 'In progress',
    color: 'var(--color-blue-500)',
    n: 3,
    cards: [
      { t: 'Kanban segmented border', tag: 'design', tc: 'var(--color-opt-pink)' },
      { t: 'Inline cell editor', tag: 'editor', tc: 'var(--color-amber-500)' },
    ],
  },
  {
    name: 'Review',
    color: 'var(--color-opt-yellow)',
    n: 2,
    cards: [{ t: 'Drag-reorder workspaces', tag: 'sidebar', tc: 'var(--color-opt-purple)' }],
  },
  {
    name: 'Done',
    color: 'var(--color-green-400)',
    n: 7,
    cards: [
      { t: 'TanStack Query provider', tag: 'infra', tc: 'var(--color-opt-purple)' },
      { t: 'Demo mode reset action', tag: 'auth', tc: 'var(--color-opt-teal)' },
    ],
  },
] as const;

interface KanbanMiniProps {
  width?: number;
}

export default function KanbanMini({ width = 340 }: KanbanMiniProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2 bg-neutral-850 p-3.5 text-[11.5px]"
      style={{ width }}
    >
      {COLS.map((col) => (
        <div key={col.name} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
            <span className="text-neutral-100 font-medium leading-none">{col.name}</span>
            <span className="text-dim text-[10px]">{col.n}</span>
          </div>
          {col.cards.map((c) => (
            <div
              key={c.t}
              className="bg-neutral-900 rounded-[3px] flex flex-col gap-1 p-[6px_8px]"
              style={{ border: '1px solid var(--color-neutral-800)', borderLeft: `2px solid ${c.tc}` }}
            >
              <span className="text-neutral-100 text-[11px] leading-[1.3]">{c.t}</span>
              <span
                className="self-start font-mono text-[9.5px] rounded-[2px] px-1 py-0"
                style={{ color: c.tc, background: `color-mix(in oklab, ${c.tc} 14%, transparent)` }}
              >
                {c.tag}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
