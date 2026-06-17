'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { WorkspaceItemRow } from '@/lib/actions/workspace';

export type TabMeta = {
  title: string;
  icon: string | null;
  iconColor: string | null;
};

export type Tab = TabMeta & {
  id: string;
  href: string;
};

type TabsContextValue = {
  tabs: Tab[];
  activeId: string | null;
  /** Resolve live meta from the workspace item list. Returns null for DB row pages. */
  resolveMeta: (href: string) => TabMeta | null;
  openInNewTab: (href: string, metaHint?: Partial<TabMeta>) => void;
  activateTab: (id: string) => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeAll: () => void;
  reorderTabs: (fromId: string, toId: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

/** Safe to call outside the provider (web build): returns null. */
export function useTabs(): TabsContextValue | null {
  return useContext(TabsContext);
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Strip query/hash; usePathname already omits them, but be defensive. */
function normalizePath(p: string): string {
  let s = (p || '').split('?')[0].split('#')[0];
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s;
}

/** A path that should live in a tab (content routes only). */
function isTabbable(norm: string): boolean {
  return /^\/(page|db)\//.test(norm);
}

function isRowPath(norm: string): boolean {
  return /^\/db\/[^/]+\/[^/]+$/.test(norm);
}

/** Internal link that should be hijacked into a tab (ctrl/middle-click). */
function isInternalTabbable(href: string | null | undefined): href is string {
  if (!href) return false;
  if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/\\')) return false;
  return isTabbable(normalizePath(href));
}

function cleanDocTitle(): string {
  const raw = typeof document !== 'undefined' ? document.title : '';
  return raw.replace(/\s*\|\s*Remnus\s*$/, '').trim();
}

export function TabsProvider({
  items,
  workspaceId,
  children,
}: {
  items: WorkspaceItemRow[];
  workspaceId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const storageKey = `remnus_tabs_${workspaceId || 'default'}`;

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Latest-value refs for event handlers (assigned during render → always current).
  const tabsRef = useRef(tabs);
  const pathnameRef = useRef(pathname);
  // eslint-disable-next-line react-hooks/refs
  tabsRef.current = tabs;
  // eslint-disable-next-line react-hooks/refs
  pathnameRef.current = pathname;

  // Previous tabbable path — lets the sync effect know which tab to navigate-in-place.
  const prevPathRef = useRef<string>('');
  // Id of a freshly-opened "new tab" placeholder whose final href the next
  // navigation resolves (so `+` → /app collapses into the redirect target).
  const pendingNewTabRef = useRef<string | null>(null);

  const resolveMeta = useCallback(
    (href: string): TabMeta | null => {
      const norm = normalizePath(href);
      const parts = norm.split('/').filter(Boolean); // e.g. ['db','id','pageId']
      if (parts[0] === 'page' && parts[1]) {
        const item = items.find((i) => i.id === parts[1]);
        if (item) return { title: item.title, icon: item.icon, iconColor: item.iconColor };
      } else if (parts[0] === 'db' && parts[1] && !parts[2]) {
        const item = items.find((i) => i.databaseId === parts[1]);
        if (item) return { title: item.title, icon: item.icon, iconColor: item.iconColor };
      }
      // DB row pages (/db/x/y) have no workspace item — caller falls back to the tab snapshot.
      return null;
    },
    [items],
  );

  // Active tab is DERIVED from the current pathname (hrefs are unique), so there is
  // no separate activeId state to drift out of sync.
  const activeId = useMemo(() => {
    const norm = normalizePath(pathname);
    return tabs.find((t) => normalizePath(t.href) === norm)?.id ?? null;
  }, [tabs, pathname]);

  // ── Hydrate from localStorage on mount (keyed per workspace) ──────────────
  useEffect(() => {
    let loaded: { tabs?: Tab[] } | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      /* ignore corrupt storage */
    }

    let nextTabs: Tab[] = [];
    if (loaded?.tabs?.length) {
      // Drop tabs whose backing item was deleted (page/db only; rows can't be checked).
      nextTabs = loaded.tabs.filter((t) => {
        const norm = normalizePath(t.href);
        if (isRowPath(norm)) return true;
        return resolveMeta(t.href) !== null;
      });
    }

    setTabs(nextTabs);
    setHydrated(true);
    // Current path is reconciled by the sync effect once `hydrated` flips true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage on change ────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ tabs }));
    } catch {
      /* ignore quota errors */
    }
  }, [tabs, hydrated, storageKey]);

  // ── Reconcile the tab list with the current pathname ──────────────────────
  // Uses a functional updater so concurrent additions (rapid new-tab opens) never
  // get clobbered by a stale snapshot.
  useEffect(() => {
    if (!hydrated) return;
    const norm = normalizePath(pathname);
    if (!isTabbable(norm)) return; // ignore /app, /login etc — don't disturb tabs

    const pendingId = pendingNewTabRef.current;
    const prevPath = prevPathRef.current;
    pendingNewTabRef.current = null;
    prevPathRef.current = norm;

    setTabs((prev) => {
      const meta = resolveMeta(norm);
      const mk = (over?: Partial<Tab>): Tab => ({
        id: newId(),
        href: norm,
        title: meta?.title ?? cleanDocTitle() ?? '',
        icon: meta?.icon ?? null,
        iconColor: meta?.iconColor ?? null,
        ...over,
      });

      // A real (non-placeholder) tab already points here → just drop any unused placeholder.
      const existing = prev.find((t) => t.id !== pendingId && normalizePath(t.href) === norm);
      if (existing) {
        return pendingId ? prev.filter((t) => t.id !== pendingId) : prev;
      }

      // The placeholder we just opened resolves into this path.
      if (pendingId && prev.some((t) => t.id === pendingId)) {
        return prev.map((t) =>
          t.id === pendingId
            ? { ...t, href: norm, title: meta?.title ?? cleanDocTitle() ?? t.title, icon: meta?.icon ?? null, iconColor: meta?.iconColor ?? null }
            : t,
        );
      }

      // Navigate-in-place: the tab that was active (matched the previous path) follows along.
      const activeTab = prev.find((t) => normalizePath(t.href) === prevPath);
      if (activeTab) {
        return prev.map((t) =>
          t.id === activeTab.id
            ? { ...t, href: norm, title: meta?.title ?? cleanDocTitle() ?? t.title, icon: meta?.icon ?? null, iconColor: meta?.iconColor ?? null }
            : t,
        );
      }

      // Nothing to follow → append a fresh tab.
      return [...prev, mk()];
    });
     
  }, [pathname, hydrated, resolveMeta]);

  // ── Keep the active DB-row tab's title in sync with document.title ─────────
  useEffect(() => {
    if (!hydrated) return;
    const titleEl = document.querySelector('title');
    if (!titleEl) return;

    const sync = () => {
      const norm = normalizePath(pathnameRef.current);
      if (!isRowPath(norm)) return; // only rows rely on document.title
      const fresh = cleanDocTitle();
      if (!fresh) return;
      setTabs((prev) =>
        prev.map((t) => (normalizePath(t.href) === norm && t.title !== fresh ? { ...t, title: fresh } : t)),
      );
    };

    sync();
    const obs = new MutationObserver(sync);
    obs.observe(titleEl, { childList: true });
    return () => obs.disconnect();
  }, [hydrated, pathname]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const openInNewTab = useCallback(
    (href: string, metaHint?: Partial<TabMeta>) => {
      const norm = normalizePath(href);
      const existing = tabsRef.current.find((t) => normalizePath(t.href) === norm);
      if (existing) {
        router.push(href);
        return;
      }
      const meta = isTabbable(norm) ? resolveMeta(norm) : null;
      const tab: Tab = {
        id: newId(),
        href: norm,
        title: meta?.title ?? metaHint?.title ?? '',
        icon: meta?.icon ?? metaHint?.icon ?? null,
        iconColor: meta?.iconColor ?? metaHint?.iconColor ?? null,
      };
      pendingNewTabRef.current = tab.id;
      setTabs((prev) => [...prev, tab]);
      router.push(href);
    },
    [resolveMeta, router],
  );

  const activateTab = useCallback(
    (id: string) => {
      const tab = tabsRef.current.find((t) => t.id === id);
      if (tab) router.push(tab.href);
    },
    [router],
  );

  const closeTab = useCallback(
    (id: string) => {
      const current = tabsRef.current;
      const idx = current.findIndex((t) => t.id === id);
      if (idx === -1) return;
      const wasActive = normalizePath(current[idx].href) === normalizePath(pathnameRef.current);
      setTabs((prev) => prev.filter((t) => t.id !== id));
      if (wasActive) {
        const next = current.filter((t) => t.id !== id);
        const neighbor = next[idx] ?? next[idx - 1] ?? null;
        router.push(neighbor ? neighbor.href : '/app');
      }
    },
    [router],
  );

  const closeOthers = useCallback(
    (id: string) => {
      const keep = tabsRef.current.find((t) => t.id === id);
      if (!keep) return;
      setTabs([keep]);
      if (normalizePath(keep.href) !== normalizePath(pathnameRef.current)) router.push(keep.href);
    },
    [router],
  );

  const closeAll = useCallback(() => {
    setTabs([]);
    router.push('/app');
  }, [router]);

  const reorderTabs = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setTabs((prev) => {
      const from = prev.findIndex((t) => t.id === fromId);
      const to = prev.findIndex((t) => t.id === toId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  // ── Global ctrl/middle-click on internal links → open in a new tab ─────────
  // Covers the sidebar, in-editor page links, and links inside modals — anywhere
  // an internal <a href> is clicked.
  useEffect(() => {
    const onAux = (e: MouseEvent) => {
      if (e.button !== 1) return;
      const a = (e.target as HTMLElement | null)?.closest('a');
      const href = a?.getAttribute('href');
      if (isInternalTabbable(href)) {
        e.preventDefault();
        e.stopPropagation();
        openInNewTab(href);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || !(e.metaKey || e.ctrlKey)) return;
      const a = (e.target as HTMLElement | null)?.closest('a');
      const href = a?.getAttribute('href');
      if (isInternalTabbable(href)) {
        e.preventDefault();
        e.stopPropagation();
        openInNewTab(href);
      }
    };
    document.addEventListener('auxclick', onAux, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('auxclick', onAux, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [openInNewTab]);

  const value = useMemo<TabsContextValue>(
    () => ({
      tabs,
      activeId,
      resolveMeta,
      openInNewTab,
      activateTab,
      closeTab,
      closeOthers,
      closeAll,
      reorderTabs,
    }),
    [tabs, activeId, resolveMeta, openInNewTab, activateTab, closeTab, closeOthers, closeAll, reorderTabs],
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}
