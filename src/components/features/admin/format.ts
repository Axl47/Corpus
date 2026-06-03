// Shared formatting helpers for the admin panel.

export function safeDate(val: Date | string | number | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(val: Date | string | number | null | undefined, locale: string): string {
  const d = safeDate(val);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

/** Compact human-readable duration: "0m", "12m", "3h 5m", "2d 4h". */
export function formatDuration(totalSeconds: number | null | undefined): string {
  const s = Math.max(0, Math.floor(totalSeconds ?? 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h < 24) return remM ? `${h}h ${remM}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const remH = h % 24;
  return remH ? `${d}d ${remH}h` : `${d}d`;
}

/** Relative "last active" label, e.g. "5m ago", "2d ago", or "—". */
export function formatRelative(
  ms: number | null | undefined,
  labels: { now: string; minutesAgo: (n: number) => string; hoursAgo: (n: number) => string; daysAgo: (n: number) => string },
): string {
  if (!ms) return '—';
  const diff = Date.now() - ms;
  if (diff < 60_000) return labels.now;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return labels.minutesAgo(mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return labels.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  return labels.daysAgo(days);
}
