'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, Calendar, ChevronLeft, ChevronRight,
  ChevronDown, ChevronRight as ChevronRightIcon, Trash2, Database,
} from 'lucide-react';
import { adminDeleteWorkspace } from '@/lib/actions/workspace';

type WorkspaceRow = {
  id: string;
  name: string;
  memberCount: number;
  itemCount: number;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date | string | number | null;
};

type WorkspaceItem = {
  id: string;
  workspaceId: string;
  type: 'page' | 'database';
  title: string;
  icon: string | null;
};

function safeDate(val: Date | string | number | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(val: Date | string | number | null | undefined) {
  const d = safeDate(val);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

function ItemIcon({ icon, type }: { icon: string | null; type: 'page' | 'database' }) {
  const isEmoji = icon && [...icon].length <= 2;
  if (isEmoji) return <span className="text-sm leading-none" translate="no">{icon}</span>;
  return type === 'database'
    ? <Database size={13} className="text-neutral-500" />
    : <FileText size={13} className="text-neutral-500" />;
}

const PAGE_SIZE = 10;

export default function AdminWorkspacesTable({
  workspaces,
  items,
}: {
  workspaces: WorkspaceRow[];
  items: WorkspaceItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const itemsByWorkspace = items.reduce<Record<string, WorkspaceItem[]>>((acc, item) => {
    if (!acc[item.workspaceId]) acc[item.workspaceId] = [];
    acc[item.workspaceId].push(item);
    return acc;
  }, {});

  const total = workspaces.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const slice = workspaces.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await adminDeleteWorkspace(id);
      setConfirmDeleteId(null);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {total === 0 ? (
        <div className="py-10 text-center text-xs text-neutral-600">No workspaces found.</div>
      ) : (
        <>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60">
                <th className="w-8 px-2" />
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">Members</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">Items</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-36">Created</th>
                <th className="w-24 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {slice.map((ws) => {
                const isExpanded = expandedIds.has(ws.id);
                const wsItems = itemsByWorkspace[ws.id] ?? [];
                const isConfirming = confirmDeleteId === ws.id;
                const isDeleting = deletingId === ws.id;

                return (
                  <>
                    <tr
                      key={ws.id}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                    >
                      {/* Expand toggle */}
                      <td className="px-2 py-3">
                        <button
                          onClick={() => toggleExpand(ws.id)}
                          className="p-0.5 text-neutral-600 hover:text-neutral-300 transition-colors"
                          title={isExpanded ? 'Collapse' : 'Show items'}
                        >
                          {isExpanded
                            ? <ChevronDown size={14} />
                            : <ChevronRightIcon size={14} />}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-200">{ws.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        {ws.ownerName || ws.ownerEmail ? (
                          <div>
                            {ws.ownerName && <span className="text-neutral-300 text-sm">{ws.ownerName}</span>}
                            {ws.ownerEmail && <p className="text-xs text-neutral-500">{ws.ownerEmail}</p>}
                          </div>
                        ) : (
                          <span className="text-neutral-600 text-xs">No owner</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                          <Users size={12} />
                          {ws.memberCount}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                          <FileText size={12} />
                          {ws.itemCount}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                          <Calendar size={11} />
                          {formatDate(ws.createdAt)}
                        </div>
                      </td>

                      {/* Delete / confirm */}
                      <td className="px-4 py-3">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDelete(ws.id)}
                              disabled={isDeleting}
                              className="text-[11px] font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                            >
                              {isDeleting ? 'Deleting…' : 'Confirm'}
                            </button>
                            <span className="text-neutral-700">·</span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(ws.id)}
                            className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                            title="Delete workspace"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded items sub-row */}
                    {isExpanded && (
                      <tr key={`${ws.id}-items`} className="border-b border-neutral-800/50 bg-neutral-900/30">
                        <td />
                        <td colSpan={6} className="px-4 py-3">
                          {wsItems.length === 0 ? (
                            <p className="text-xs text-neutral-600 italic">No items in this workspace.</p>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {wsItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-2.5">
                                  <ItemIcon icon={item.icon} type={item.type} />
                                  <span className="text-xs text-neutral-300">{item.title}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    item.type === 'database'
                                      ? 'bg-blue-500/10 text-blue-400'
                                      : 'bg-neutral-800 text-neutral-500'
                                  }`}>
                                    {item.type === 'database' ? 'Database' : 'Page'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-800 bg-neutral-900/40">
              <span className="text-xs text-neutral-500">
                {from}–{to} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-neutral-500 px-1">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
