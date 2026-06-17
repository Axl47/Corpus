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
  const [activeIdState, setActiveIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Latest-value refs for event handlers / effects (assigned during render → always current).
  const tabsRef = useRef(tabs);
  const activeIdRef = useRef(activeIdState);
  const pathnameRef = useRef(pathname);
  // eslint-disable-next-line react-hooks/refs
  tabsRef.current = tabs;
  // eslint-disable-next-line react-hooks/refs
  activeIdRef.current = activeIdState;
  // eslint-disable-next-line react-hooks/refs
  pathnameRef.current = pathname;

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

  // Effective active id: the explicit state when it still points at a live tab,
  // otherwise fall back to the first tab matching the current path (robust to drift).
  const activeId = useMemo(() => {
    if (activeIdState && tabs.some((t) => t.id === activeIdState)) return activeIdState;
    const norm = normalizePath(pathname);
    return tabs.find((t) => normalizePath(t.href) === norm)?.id ?? null;
  }, [activeIdState, tabs, pathname]);

  const makeTab = useCallback(
    (norm: string, id: string, metaHint?: Partial<TabMeta>): Tab => {
      const meta = isTabbable(norm) ? resolveMeta(norm) : null;
      // Only DB rows fall back to document.title; non-tabbable placeholders (e.g. /app
      // before its redirect resolves) get an empty title to avoid showing a stale one.
      const title = meta?.title ?? metaHint?.title ?? (isRowPath(norm) ? cleanDocTitle() : '');
      return {
        id,
        href: norm,
        title,
        icon: meta?.icon ?? metaHint?.icon ?? null,
        iconColor: meta?.iconColor ?? metaHint?.iconColor ?? null,
      };
    },
    [resolveMeta],
  );

  // ── Hydrate from localStorage on mount (keyed per workspace) ──────────────
  useEffect(() => {
    let loaded: { tabs?: Tab[]; activeId?: string | null } | null = null;
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
    // Prefer the tab matching the current URL; else the stored active id if still valid.
    const norm = normalizePath(pathname);
    const match = nextTabs.find((t) => normalizePath(t.href) === norm);
    if (match) setActiveIdState(match.id);
    else if (loaded?.activeId && nextTabs.some((t) => t.id === loaded!.activeId)) setActiveIdState(loaded.activeId);

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage on change ────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ tabs, activeId: activeIdState }));
    } catch {
      /* ignore quota errors */
    }
  }, [tabs, activeIdState, hydrated, storageKey]);

  // ── Reconcile the tab list with the current pathname ──────────────────────
  // The active tab follows navigation in place (the chosen "open in active tab"
  // model). New/duplicate tabs are created only by explicit user actions
  // (openInNewTab) — never here. All writes use functional updaters + a
  // deterministic auto-id so React Strict Mode's double-invoke can't duplicate.
  useEffect(() => {
    if (!hydrated) return;
    const norm = normalizePath(pathname);
    if (!isTabbable(norm)) return; // ignore /app, /login, redirects-in-progress

    const cur = tabsRef.current;
    const activeTab = cur.find((t) => t.id === activeIdRef.current);

    if (activeTab) {
      if (normalizePath(activeTab.href) === norm) return; // already showing this path
      // Navigate the active tab in place.
      const meta = resolveMeta(norm);
      const id = activeTab.id;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, href: norm, title: meta?.title ?? cleanDocTitle() ?? t.title, icon: meta?.icon ?? null, iconColor: meta?.iconColor ?? null }
            : t,
        ),
      );
      return;
    }

    // No valid active tab → switch to an existing match, or auto-create one.
    const match = cur.find((t) => normalizePath(t.href) === norm);
    if (match) {
      setActiveIdState(match.id);
      return;
    }
    const autoId = `auto:${norm}`;
    const tab = makeTab(norm, autoId);
    setTabs((prev) => (prev.some((t) => normalizePath(t.href) === norm) ? prev : [...prev, tab]));
    setActiveIdState(autoId);
     
  }, [pathname, hydrated, resolveMeta, makeTab]);

  // ── Keep DB-row tab titles in sync with document.title ────────────────────
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
  // Always appends a fresh tab — duplicates of the same page are allowed (browser model).
  const openInNewTab = useCallback(
    (href: string, metaHint?: Partial<TabMeta>) => {
      const norm = normalizePath(href);
      const tab = makeTab(norm, newId(), metaHint);
      setTabs((prev) => [...prev, tab]);
      setActiveIdState(tab.id);
      router.push(href);
    },
    [makeTab, router],
  );

  const activateTab = useCallback(
    (id: string) => {
      const tab = tabsRef.current.find((t) => t.id === id);
      if (!tab) return;
      setActiveIdState(id);
      router.push(tab.href);
    },
    [router],
  );

  const closeTab = useCallback(
    (id: string) => {
      const cur = tabsRef.current;
      const idx = cur.findIndex((t) => t.id === id);
      if (idx === -1) return;

      const rawActive = activeIdRef.current;
      const effActive =
        rawActive && cur.some((t) => t.id === rawActive)
          ? rawActive
          : cur.find((t) => normalizePath(t.href) === normalizePath(pathnameRef.current))?.id ?? null;

      const next = cur.filter((t) => t.id !== id);
      setTabs(next);

      if (id === effActive) {
        const neighbor = next[idx] ?? next[idx - 1] ?? null;
        if (neighbor) {
          setActiveIdState(neighbor.id);
          router.push(neighbor.href);
        } else {
          setActiveIdState(null);
          router.push('/app');
        }
      }
    },
    [router],
  );

  const closeOthers = useCallback(
    (id: string) => {
      const keep = tabsRef.current.find((t) => t.id === id);
      if (!keep) return;
      setTabs([keep]);
      setActiveIdState(keep.id);
      if (normalizePath(keep.href) !== normalizePath(pathnameRef.current)) router.push(keep.href);
    },
    [router],
  );

  const closeAll = useCallback(() => {
    setTabs([]);
    setActiveIdState(null);
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
  // Covers the sidebar, in-editor page links, and links inside modals.
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
