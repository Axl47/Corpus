'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Calendar, ChevronLeft, ChevronRight, Mail, Globe, Trash2 } from 'lucide-react';
import { adminDeleteUser } from '@/lib/actions/auth';
import { useTranslations, useLocale } from 'next-intl';

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date | string | number | null;
  authType: 'google' | 'email' | 'unknown';
};

function safeDate(val: Date | string | number | null | undefined): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(val: Date | string | number | null | undefined, locale: string) {
  const d = safeDate(val);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

const PAGE_SIZE = 10;

export default function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const total = users.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const slice = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await adminDeleteUser(id);
      setConfirmDeleteId(null);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      {total === 0 ? (
        <div className="py-10 text-center text-xs text-neutral-600">{t('noUsers')}</div>
      ) : (
        <>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">{t('colName')}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">{t('colEmail')}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">{t('colSignIn')}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">{t('colRole')}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider w-36">{t('colJoined')}</th>
                <th className="w-24 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {slice.map((u) => {
                const isSelf = u.id === currentUserId;
                const isConfirming = confirmDeleteId === u.id;
                const isDeleting = deletingId === u.id;

                return (
                  <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors last:border-0">
                    <td className="px-4 py-3">
                      <span className="text-neutral-200 font-medium">{u.name ?? <span className="text-neutral-600 italic">—</span>}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-neutral-400 text-xs">{u.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.authType === 'google' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                          <Globe size={9} />
                          {t('signInGoogle')}
                        </span>
                      ) : u.authType === 'email' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                          <Mail size={9} />
                          {t('signInEmail')}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          <Shield size={9} />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">User</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <Calendar size={11} />
                        {formatDate(u.createdAt, locale)}
                      </div>
                    </td>

                    {/* Delete / confirm */}
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-[10px] text-neutral-700">{t('youBadge')}</span>
                      ) : isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={isDeleting}
                            className="text-[11px] font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                          >
                            {isDeleting ? 'Deleting…' : t('confirm')}
                          </button>
                          <span className="text-neutral-700">·</span>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
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
