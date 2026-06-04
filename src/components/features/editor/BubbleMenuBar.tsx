'use client';
import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Bold, Italic, Strikethrough, Code, ChevronDown, Link2, ArrowLeft, Check, X,
  Pilcrow, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'ordered' | 'quote' | 'code';

const BLOCK_APPLIES: Record<BlockType, (e: Editor) => void> = {
  paragraph: (e) => e.chain().focus().clearNodes().run(),
  h1: (e) => e.chain().focus().clearNodes().setNode('heading', { level: 1 }).run(),
  h2: (e) => e.chain().focus().clearNodes().setNode('heading', { level: 2 }).run(),
  h3: (e) => e.chain().focus().clearNodes().setNode('heading', { level: 3 }).run(),
  bullet: (e) => { if (e.isActive('bulletList')) return; if (e.isActive('orderedList')) e.chain().focus().toggleOrderedList().run(); e.chain().focus().toggleBulletList().run(); },
  ordered: (e) => { if (e.isActive('orderedList')) return; if (e.isActive('bulletList')) e.chain().focus().toggleBulletList().run(); e.chain().focus().toggleOrderedList().run(); },
  quote: (e) => e.chain().focus().clearNodes().toggleBlockquote().run(),
  code: (e) => e.chain().focus().clearNodes().toggleCodeBlock().run(),
};

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  paragraph: <Pilcrow size={14} />,
  h1: <Heading1 size={14} />,
  h2: <Heading2 size={14} />,
  h3: <Heading3 size={14} />,
  bullet: <List size={14} />,
  ordered: <ListOrdered size={14} />,
  quote: <Quote size={14} />,
  code: <Code2 size={14} />,
};

const BLOCK_TYPES: BlockType[] = ['paragraph', 'h1', 'h2', 'h3', 'bullet', 'ordered', 'quote', 'code'];

function getActiveType(editor: Editor): BlockType {
  if (editor.isActive('heading', { level: 1 })) return 'h1';
  if (editor.isActive('heading', { level: 2 })) return 'h2';
  if (editor.isActive('heading', { level: 3 })) return 'h3';
  if (editor.isActive('bulletList')) return 'bullet';
  if (editor.isActive('orderedList')) return 'ordered';
  if (editor.isActive('blockquote')) return 'quote';
  if (editor.isActive('codeBlock')) return 'code';
  return 'paragraph';
}

type Bounds = { minTop: number; maxBottom: number; minLeft: number; maxRight: number };
type Layout = { top: number; left: number; bounds: Bounds };
type Mode = 'format' | 'link';

function findScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let cur = el.parentElement;
  while (cur && cur !== document.documentElement) {
    const ov = window.getComputedStyle(cur).overflowY;
    if (ov === 'auto' || ov === 'scroll') return cur;
    cur = cur.parentElement;
  }
  return null;
}

type Props = { editor: Editor };

function Btn({ onClick, active, children, title }: { onClick: () => void; active: boolean; children: React.ReactNode; title?: string }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`px-2 py-1.5 transition-colors text-xs font-medium ${
        active ? 'text-white bg-neutral-700' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
      }`}
    >
      {children}
    </button>
  );
}

const TOOLBAR_H = 36;
const DROP_H = BLOCK_TYPES.length * 36 + 28;
const MARGIN = 6;

function normalizeHref(raw: string): string {
  const h = raw.trim();
  if (!h) return '';
  if (/^(https?:\/\/|\/|#|mailto:)/.test(h)) return h;
  return `https://${h}`;
}

export default function BubbleMenuBar({ editor }: Props) {
  const t = useTranslations('Editor');

  const BLOCK_LABELS: Record<BlockType, string> = {
    paragraph: t('slashParagraph'),
    h1: t('slashHeading1'),
    h2: t('slashHeading2'),
    h3: t('slashHeading3'),
    bullet: t('slashBulletList'),
    ordered: t('slashNumberedList'),
    quote: t('slashQuote'),
    code: t('slashCodeBlock'),
  };

  const BLOCK_OPTIONS = BLOCK_TYPES.map((type) => ({
    type,
    label: BLOCK_LABELS[type],
    icon: BLOCK_ICONS[type],
    apply: BLOCK_APPLIES[type],
  }));

  const [layout, setLayout] = useState<Layout | null>(null);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [modeState, setModeState] = useState<Mode>('format');
  const [linkText, setLinkText] = useState('');
  const [linkHref, setLinkHref] = useState('');
  const modeRef = useRef<Mode>('format');
  const linkWasActive = useRef(false);
  const linkInitialText = useRef('');
  const menuRef = useRef<HTMLDivElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const linkHrefInputRef = useRef<HTMLInputElement>(null);
  const linkTextInputRef = useRef<HTMLInputElement>(null);

  const setMode = (m: Mode) => { modeRef.current = m; setModeState(m); };

  // ── Link editor logic ────────────────────────────────────────────────────────

  const openLinkEditor = () => {
    // Extend selection to full link range when cursor is inside one
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').run();
    }
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '');
    const href = editor.getAttributes('link').href ?? '';
    linkWasActive.current = editor.isActive('link');
    linkInitialText.current = text;
    setLinkText(text);
    setLinkHref(href);
    setMode('link');
  };

  const cancelLink = () => {
    setMode('format');
    editor.chain().focus().run();
  };

  const applyLink = () => {
    const href = normalizeHref(linkHref);
    if (!href) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setMode('format');
      return;
    }

    const textChanged = linkWasActive.current && linkText !== linkInitialText.current && linkText.length > 0;

    if (textChanged) {
      // Replace text content + set link mark
      editor.chain()
        .focus()
        .extendMarkRange('link')
        .command(({ tr, state, dispatch }) => {
          if (!dispatch) return true;
          const { from, to } = state.selection;
          const mark = state.schema.marks.link?.create({ href });
          const node = mark
            ? state.schema.text(linkText, [mark])
            : state.schema.text(linkText);
          tr.replaceWith(from, to, node);
          return true;
        })
        .run();
    } else {
      // Update URL only — preserves existing marks on the selection
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setMode('format');
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setMode('format');
  };

  // Focus URL input on entering link mode; focus text if URL already set
  useEffect(() => {
    if (modeState !== 'link') return;
    const target = linkWasActive.current && linkHref ? linkTextInputRef : linkHrefInputRef;
    setTimeout(() => target.current?.focus(), 30);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeState]);

  // ── Position tracking ────────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      const { empty } = editor.state.selection;
      if (empty || (!editor.isFocused && modeRef.current !== 'link')) {
        setLayout(null);
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setLayout(null); return; }
      const selRect = sel.getRangeAt(0).getBoundingClientRect();
      if (selRect.width === 0) { setLayout(null); return; }

      const anchor = anchorRef.current;
      if (!anchor) { setLayout(null); return; }
      const anchorRect = anchor.getBoundingClientRect();

      const scrollable = findScrollableAncestor(editor.view.dom);
      const vp = scrollable
        ? scrollable.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };

      const bounds: Bounds = {
        minTop:    vp.top    - anchorRect.top  + MARGIN,
        maxBottom: vp.bottom - anchorRect.top  - MARGIN,
        minLeft:   vp.left   - anchorRect.left + MARGIN,
        maxRight:  vp.right  - anchorRect.left - MARGIN,
      };

      const menuWidth = menuRef.current?.offsetWidth ?? Math.min(380, window.innerWidth - 32);
      const topAbove = selRect.top    - TOOLBAR_H - 8 - anchorRect.top;
      const topBelow = selRect.bottom + 8              - anchorRect.top;
      const top = topAbove >= bounds.minTop ? topAbove : topBelow;
      const idealLeft = selRect.left + selRect.width / 2 - menuWidth / 2 - anchorRect.left;
      const left = Math.max(bounds.minLeft, Math.min(idealLeft, bounds.maxRight - menuWidth));

      setLayout({ top, left, bounds });
    };

    const hide = () => {
      setTimeout(() => {
        const active = document.activeElement;
        const inMenu = menuRef.current?.contains(active);
        const inDrop = blockMenuRef.current?.contains(active);
        if (!inMenu && !inDrop) {
          setLayout(null);
          setMode('format');
        }
      }, 0);
    };

    editor.on('selectionUpdate', update);
    editor.on('blur', hide);
    return () => { editor.off('selectionUpdate', update); editor.off('blur', hide); };
  }, [editor]);

  useEffect(() => { if (!layout) setBlockMenuOpen(false); }, [layout]);

  useEffect(() => {
    if (!blockMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const inBar = menuRef.current?.contains(e.target as Node);
      const inDrop = blockMenuRef.current?.contains(e.target as Node);
      if (!inBar && !inDrop) setBlockMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [blockMenuOpen]);

  const activeType = getActiveType(editor);
  const currentOpt = BLOCK_OPTIONS.find((o) => o.type === activeType);
  const dropTop = layout
    ? (layout.top + TOOLBAR_H + DROP_H <= layout.bounds.maxBottom
        ? layout.top + TOOLBAR_H + 2
        : layout.top - DROP_H - 2)
    : 0;

  // ── Input class helpers ──────────────────────────────────────────────────────

  const inputCls = 'bg-transparent text-neutral-200 text-xs outline-none placeholder-neutral-600 py-1 px-1 min-w-0';
  const iconBtnCls = (active?: boolean) =>
    `flex items-center justify-center px-2 py-1.5 transition-colors ${
      active ? 'text-white bg-neutral-700' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
    }`;

  return (
    <>
      {/* Coordinate-system probe */}
      <div
        ref={anchorRef}
        style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none', visibility: 'hidden', zIndex: -1 }}
      />

      {layout && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: layout.top, left: layout.left, zIndex: 9999 }}
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden"
        >
          {modeState === 'format' ? (
            <>
              {/* Block-type picker */}
              <button
                onMouseDown={(e) => { e.preventDefault(); setBlockMenuOpen((v) => !v); }}
                className={`flex items-center gap-1 px-2 py-1.5 transition-colors ${
                  blockMenuOpen ? 'text-neutral-100 bg-neutral-800' : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
                title={t('bubbleTurnInto')}
              >
                {currentOpt?.icon}
                <ChevronDown size={10} />
              </button>

              <div className="w-px h-4 bg-neutral-700 self-center" />

              <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title={t('bubbleBold')}>
                <Bold size={13} />
              </Btn>
              <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title={t('bubbleItalic')}>
                <Italic size={13} />
              </Btn>
              <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title={t('bubbleStrike')}>
                <Strikethrough size={13} />
              </Btn>
              <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title={t('bubbleCode')}>
                <Code size={13} />
              </Btn>

              <div className="w-px h-4 bg-neutral-700 self-center mx-0.5" />

              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>H1</Btn>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</Btn>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</Btn>

              <div className="w-px h-4 bg-neutral-700 self-center mx-0.5" />

              <Btn onClick={openLinkEditor} active={editor.isActive('link')} title={t('bubbleLinkEdit')}>
                <Link2 size={13} />
              </Btn>
            </>
          ) : (
            <>
              {/* Link editor */}
              <button
                onMouseDown={(e) => { e.preventDefault(); cancelLink(); }}
                className={iconBtnCls()}
                title="Back"
              >
                <ArrowLeft size={13} />
              </button>

              <div className="w-px h-4 bg-neutral-700 self-center" />

              <span className="text-xs text-neutral-600 px-1.5 select-none whitespace-nowrap">{t('bubbleLinkText')}</span>
              <input
                ref={linkTextInputRef}
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                  if (e.key === 'Escape') { e.preventDefault(); cancelLink(); }
                }}
                className={`${inputCls} w-28`}
                placeholder={t('bubbleLinkText')}
              />

              <div className="w-px h-4 bg-neutral-700 self-center" />

              <span className="text-xs text-neutral-600 px-1.5 select-none whitespace-nowrap">{t('bubbleLinkUrl')}</span>
              <input
                ref={linkHrefInputRef}
                value={linkHref}
                onChange={(e) => setLinkHref(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                  if (e.key === 'Escape') { e.preventDefault(); cancelLink(); }
                }}
                className={`${inputCls} w-44`}
                placeholder="https://"
              />

              <div className="w-px h-4 bg-neutral-700 self-center mx-0.5" />

              <button
                onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
                className={iconBtnCls()}
                title="Apply"
              >
                <Check size={13} />
              </button>

              {linkWasActive.current && (
                <button
                  onMouseDown={(e) => { e.preventDefault(); removeLink(); }}
                  className={`${iconBtnCls()} hover:text-red-400`}
                  title={t('removeLink')}
                >
                  <X size={13} />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {layout && blockMenuOpen && (
        <div
          ref={blockMenuRef}
          style={{ position: 'fixed', top: dropTop, left: layout.left, zIndex: 10000 }}
          onMouseDown={(e) => e.preventDefault()}
          className="min-w-49 bg-neutral-900 border border-neutral-800 shadow-xl py-1 rounded-md overflow-hidden"
        >
          <div className="px-3 py-1.5 text-xs text-neutral-600 font-medium uppercase tracking-wider">{t('bubbleTurnInto')}</div>
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onMouseDown={(e) => { e.preventDefault(); opt.apply(editor); setBlockMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                opt.type === activeType ? 'text-neutral-100 bg-neutral-800' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <span className={opt.type === activeType ? 'text-neutral-300' : 'text-neutral-600'}>{opt.icon}</span>
              <span className="text-sm">{opt.label}</span>
              {opt.type === activeType && <Check size={12} className="ml-auto text-neutral-400" />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
