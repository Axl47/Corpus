'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, List, X } from 'lucide-react';
import PageIcon from '@/components/features/PageIcon';
import type { SharedNavItem } from '@/app/[locale]/share/[...slug]/page';

function NavNode({
  item,
  currentPageId,
  depth,
}: {
  item: SharedNavItem;
  currentPageId: string;
  depth: number;
}) {
  const isCurrent = item.id === currentPageId;
  const hasChildren = item.children.length > 0;

  // Auto-expand if current page is in this subtree
  const containsCurrent = (node: SharedNavItem): boolean =>
    node.id === currentPageId || node.children.some(containsCurrent);
  const [open, setOpen] = useState(() => containsCurrent(item));

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md py-1 pr-2 text-[13px] transition-colors ${
          isCurrent
            ? 'bg-neutral-800 text-neutral-100 font-medium'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`shrink-0 p-0.5 rounded transition-colors ${
            hasChildren ? 'hover:bg-neutral-700 cursor-pointer' : 'cursor-default opacity-0 pointer-events-none'
          }`}
          tabIndex={hasChildren ? 0 : -1}
        >
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>

        {/* Icon */}
        {item.icon && (
          <span className="shrink-0">
            <PageIcon icon={item.icon} iconColor={item.iconColor} size={14} fallbackType="page" />
          </span>
        )}

        {/* Title link */}
        <Link
          href={`/share/${item.slug}`}
          className="flex-1 truncate leading-5"
        >
          {item.title || 'Untitled'}
        </Link>
      </div>

      {hasChildren && open && (
        <div>
          {item.children.map(child => (
            <NavNode key={child.id} item={child} currentPageId={currentPageId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SharedPageNav({
  navTree,
  currentPageId,
  mobileOnly = false,
  desktopOnly = false,
}: {
  navTree: SharedNavItem[];
  currentPageId: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tree = (
    <div className="py-2 px-1">
      {navTree.map(item => (
        <NavNode key={item.id} item={item} currentPageId={currentPageId} depth={0} />
      ))}
    </div>
  );

  if (desktopOnly) {
    return (
      <aside className="hidden md:block w-56 shrink-0 border-r border-neutral-800 bg-neutral-900/30">
        <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {tree}
        </div>
      </aside>
    );
  }

  if (mobileOnly) {
    return (
      <div className="md:hidden border-b border-neutral-800 bg-neutral-900/40">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          {mobileOpen ? <X size={13} /> : <List size={13} />}
          <span className="font-medium">Contents</span>
          <ChevronDown
            size={11}
            className={`ml-auto transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {mobileOpen && (
          <div className="border-t border-neutral-800 bg-neutral-950 pb-2">
            {tree}
          </div>
        )}
      </div>
    );
  }

  return null;
}
