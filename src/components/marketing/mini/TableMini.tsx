import LandingChip from '../LandingChip';

const ALL_ROWS = [
  { t: 'MCP token auth & rate limiting',    st: 'In progress', stc: 'var(--color-blue-500)',  due: 'May 23', a: 'EA', aiEdit: true },
  { t: 'Inline cell editor — date popover', st: 'In progress', stc: 'var(--color-blue-500)',  due: 'May 24', a: 'CK' },
  { t: 'Drag-reorder workspaces',           st: 'Review',      stc: 'var(--color-opt-yellow)', due: 'May 25', a: 'EA' },
  { t: 'Kanban segmented border accent',    st: 'Done',        stc: 'var(--color-green-400)', due: 'May 21', a: 'SK' },
  { t: 'Audit Auth.js session caching',     st: 'Backlog',     stc: 'var(--color-dim)',       due: 'May 28', a: 'EA' },
  { t: 'Mobile bottom-sheet peek modal',    st: 'Backlog',     stc: 'var(--color-dim)',       due: 'Jun 02', a: 'CK' },
];

interface TableMiniProps {
  width?: number;
  rows?: number;
}

export default function TableMini({ width = 340, rows = 6 }: TableMiniProps) {
  const shown = ALL_ROWS.slice(0, rows);
  return (
    <div className="bg-neutral-850 text-[11.5px]" style={{ width }}>
      <div
        className="grid gap-0 px-3 py-1.75 border-b border-neutral-800 bg-neutral-900 font-mono text-[10.5px] text-dim tracking-[0.04em]"
        style={{ gridTemplateColumns: '1.7fr 0.9fr 0.6fr 0.5fr' }}
      >
        <span>Title</span>
        <span>Status</span>
        <span>Due</span>
        <span>Owner</span>
      </div>
      {shown.map((r, i) => (
        <div
          key={i}
          className="relative grid items-center px-3 py-2"
          style={{
            gridTemplateColumns: '1.7fr 0.9fr 0.6fr 0.5fr',
            borderBottom: '1px solid var(--color-border-soft)',
            background: r.aiEdit ? 'rgba(68,92,149,0.10)' : 'transparent',
          }}
        >
          {r.aiEdit && (
            <span className="absolute top-0.5 right-2 font-mono text-[8.5px] text-accent-strong tracking-[0.04em]">
              · claude
            </span>
          )}
          <span className="text-neutral-100 overflow-hidden text-ellipsis whitespace-nowrap">{r.t}</span>
          <span className="inline-flex max-w-full overflow-hidden">
            <LandingChip color={r.stc} dot>
              <span className="truncate block max-w-18">{r.st}</span>
            </LandingChip>
          </span>
          <span className="font-mono text-[10.5px] text-neutral-50">{r.due}</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center font-mono text-[8px] font-semibold text-white"
              style={{ background: 'var(--color-opt-purple)' }}
            >
              {r.a}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
