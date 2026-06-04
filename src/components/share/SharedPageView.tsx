'use client';
import { useState, useCallback, useRef } from 'react';
import { Lock, PenLine, AlertCircle, Check, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import BlockEditor from '@/components/features/editor/BlockEditor';
import SharedPageNav from '@/components/share/SharedPageNav';
import { updateSharedPageContent } from '@/lib/actions/sharing';
import type { ShareRecord } from '@/lib/actions/sharing';
import type { SharedNavItem } from '@/app/[locale]/share/[...slug]/page';

interface PageData {
  id: string;
  type: string;
  title: string;
  content: string;
  properties?: Record<string, unknown>;
}

interface Props {
  page: PageData;
  share: ShareRecord;
  canEdit: boolean;
  isLoggedIn: boolean;
  shareMap: Record<string, string>;
  parentSlug?: string;
  navTree: SharedNavItem[];
  notFoundLabel: string;
  readOnlyBadge: string;
  writeBadge: string;
  saveErrorLabel: string;
  savingLabel: string;
}

export default function SharedPageView({
  page,
  share,
  canEdit,
  isLoggedIn,
  shareMap,
  parentSlug,
  navTree,
  readOnlyBadge,
  writeBadge,
  saveErrorLabel,
  savingLabel,
}: Props) {
  const tLanding = useTranslations('Landing');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(async (content: string) => {
    if (!canEdit) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const result = await updateSharedPageContent(share.id, content);
    setSaveStatus(result.error ? 'error' : 'saved');
    saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
  }, [share.id, canEdit]);

  const badge = canEdit ? writeBadge : readOnlyBadge;
  const BadgeIcon = canEdit ? PenLine : Lock;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm">
        <div className="px-4 sm:px-6 h-12 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 shrink-0 group">
            <Image
              src="/logo-square-transparent.png"
              alt="Remnus"
              width={18}
              height={18}
              className="opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm font-semibold text-neutral-300 group-hover:text-neutral-100 transition-colors tracking-tight">
              Remnus
            </span>
          </Link>

          {/* Divider */}
          <span className="hidden sm:block w-px h-4 bg-neutral-800 shrink-0" />

          {/* Page title breadcrumb */}
          <span className="hidden sm:block text-[11px] text-neutral-600 truncate flex-1 min-w-0">
            {page.title || 'Untitled'}
          </span>

          {/* Save status (only for write mode) */}
          {canEdit && saveStatus !== 'idle' && (
            <span className={`flex items-center gap-1 text-[10px] ml-auto ${
              saveStatus === 'saving' ? 'text-neutral-500'
              : saveStatus === 'saved' ? 'text-green-400'
              : 'text-red-400'
            }`}>
              {saveStatus === 'saved' && <Check size={10} />}
              {saveStatus === 'error' && <AlertCircle size={10} />}
              {saveStatus === 'saving' ? savingLabel : saveStatus === 'saved' ? 'Saved' : saveErrorLabel}
            </span>
          )}

          {/* Permission badge */}
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border shrink-0 ${
            canEdit
              ? 'border-green-500/25 bg-green-500/8 text-green-500/80'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-600'
          }`}>
            <BadgeIcon size={9} />
            {badge}
          </span>

          {/* Right-side auth CTAs — only for guests */}
          {!isLoggedIn && (
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <Link
                href="/login"
                className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors hidden sm:block"
              >
                {tLanding('navSignIn')}
              </Link>
              <Link
                href="/login"
                className="text-[11px] font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 px-2.5 py-1 rounded transition-colors"
              >
                {tLanding('navGetStarted')}
              </Link>
            </div>
          )}

          {/* Logged-in: go to app */}
          {isLoggedIn && (
            <Link
              href="/app"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 transition-colors shrink-0 hidden sm:block"
            >
              {tLanding('navGoToApp')} →
            </Link>
          )}
        </div>
      </header>

      {/* Mobile nav (above content) */}
      {navTree.length > 0 && (
        <SharedPageNav navTree={navTree} currentPageId={page.id} mobileOnly />
      )}

      {/* Body: sidebar + content */}
      <div className="flex min-h-[calc(100vh-3rem)]">
        {navTree.length > 0 && (
          <SharedPageNav navTree={navTree} currentPageId={page.id} desktopOnly />
        )}

        {/* Content — width driven by share settings */}
        <main className={`flex-1 min-w-0 px-4 sm:px-6 py-10 ${
          share.width === 'full' ? '' :
          share.width === 'wide' ? 'max-w-7xl mx-auto' :
          'max-w-4xl mx-auto'
        }`}>
          {parentSlug && !navTree.length && (
            <Link
              href={`/share/${parentSlug}`}
              className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-6"
            >
              <ChevronLeft size={15} />
              Back
            </Link>
          )}

          <h1 className="text-3xl font-bold text-neutral-100 mb-8 leading-tight">
            {page.title || 'Untitled'}
          </h1>

          <BlockEditor
            key={page.id}
            initialContent={page.content}
            onChange={canEdit ? handleChange : () => {}}
            shareMap={shareMap}
            editable={canEdit}
          />
        </main>
      </div>
    </div>
  );
}
