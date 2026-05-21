const DAYS_LABEL = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type CalEvent = { color: string; title: string };
const EVENTS: Record<number, CalEvent[]> = {
  4:  [{ color: 'var(--color-blue-500)',   title: 'Sprint Review' }],
  6:  [{ color: 'var(--color-opt-pink)',   title: 'Design sync' }],
  11: [{ color: 'var(--color-opt-yellow)', title: 'Roadmap' }],
  14: [{ color: 'var(--color-opt-purple)', title: 'Team retro' }],
  18: [{ color: 'var(--color-blue-500)',   title: 'v2.0 Release' }, { color: 'var(--color-opt-teal)', title: 'Demo' }],
  19: [{ color: 'var(--color-opt-yellow)', title: 'Planning' }],
  22: [{ color: 'var(--color-opt-teal)',   title: 'MCP launch' }],
  25: [{ color: 'var(--color-blue-500)',   title: 'Sprint end' }],
};

function buildDays() {
  const days: { d: number; dim: boolean }[] = [];
  for (let w = 0; w < 4; w++) {
    for (let c = 0; c < 7; c++) {
      const idx = w * 7 + c;
      const day = idx - 3;
      days.push({ d: day < 1 ? day + 30 : day > 31 ? day - 31 : day, dim: day < 1 || day > 31 });
    }
  }
  return days;
}

const DAYS = buildDays();

interface CalendarMiniProps {
  width?: number;
}

export default function CalendarMini({ width = 340 }: CalendarMiniProps) {
  return (
    <div className="bg-neutral-850" style={{ width }}>
      <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-900">
        {DAYS_LABEL.map((d, i) => (
          <div key={i} className="py-1.25 px-1.5 text-[10px] text-dim font-mono text-right">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {DAYS.map((day, i) => {
          const isToday = !day.dim && day.d === 18;
          const evs: CalEvent[] = !day.dim ? (EVENTS[day.d] ?? []) : [];
          return (
            <div
              key={i}
              className="flex flex-col gap-0.5 p-0.5"
              style={{
                minHeight: 52,
                borderRight: (i + 1) % 7 ? '1px solid var(--color-border-soft)' : 'none',
                borderBottom: '1px solid var(--color-border-soft)',
                background: isToday ? 'rgba(68,92,149,0.10)' : 'transparent',
                opacity: day.dim ? 0.3 : 1,
              }}
            >
              <span
                className={`text-right leading-none font-mono text-[9px] px-0.5 ${isToday ? 'font-semibold text-accent-strong' : 'text-neutral-50'}`}
              >
                {day.d}
              </span>
              {evs.map((ev, j) => (
                <div
                  key={j}
                  className="rounded-xs px-1 py-px text-[8px] leading-[1.4] truncate"
                  style={{
                    background: `color-mix(in oklab, ${ev.color} 18%, transparent)`,
                    color: ev.color,
                    borderLeft: `2px solid ${ev.color}`,
                  }}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
