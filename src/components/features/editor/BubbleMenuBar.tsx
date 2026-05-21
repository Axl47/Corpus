'use client';
import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Bold, Italic, Strikethrough, Code, ChevronDown,
  Pilcrow, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code2, Check,
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

function Btn({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1.5 transition-colors text-xs font-medium ${
        active ? 'text-white bg-neutral-700' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
      }`}
    >
      {children}
    </button>
  );
}

const TOOLBAR_H = 36;
const DROP_H = BLOCK_TYPES.length * 36 + 28; // approximate dropdown height
const MARGIN = 6;

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
  const menuRef = useRef<HTMLDivElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  // Anchor at fixed(0,0) inside the editor subtree — its rect reveals the
  // actual origin of the fixed coordinate system (displaced by any ancestor transform).
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const { empty } = editor.state.selection;
      if (empty || !editor.isFocused) { setLayout(null); return; }

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setLayout(null); return; }
      const selRect = sel.getRangeAt(0).getBoundingClientRect();
      if (selRect.width === 0) { setLayout(null); return; }

      const anchor = anchorRef.current;
      if (!anchor) { setLayout(null); return; }
      // anchorRect.{left,top} = where fixed(0,0) sits in the viewport.
      // Subtract from viewport coords to get coords in the fixed container space.
      const anchorRect = anchor.getBoundingClientRect();

      // Find the nearest scrollable container to use as the visible-area boundary.
      const scrollable = findScrollableAncestor(editor.view.dom);
      const vp = scrollable
        ? scrollable.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };

      // Convert viewport boundary → fixed-container coords
      const bounds: Bounds = {
        minTop:    vp.top    - anchorRect.top  + MARGIN,
        maxBottom: vp.bottom - anchorRect.top  - MARGIN,
        minLeft:   vp.left   - anchorRect.left + MARGIN,
        maxRight:  vp.right  - anchorRect.left - MARGIN,
      };

      const menuWidth = menuRef.current?.offsetWidth ?? Math.min(300, window.innerWidth - 32);

      // Vertical: prefer above selection; flip below when clipped.
      const topAbove = selRect.top    - TOOLBAR_H - 8 - anchorRect.top;
      const topBelow = selRect.bottom + 8              - anchorRect.top;
      const top = topAbove >= bounds.minTop ? topAbove : topBelow;

      // Horizontal: center on selection, clamped to visible area.
      const idealLeft = selRect.left + selRect.width / 2 - menuWidth / 2 - anchorRect.left;
      const left = Math.max(bounds.minLeft, Math.min(idealLeft, bounds.maxRight - menuWidth));

      setLayout({ top, left, bounds });
    };

    const hide = () => setLayout(null);
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

  // Dropdown: open below toolbar if room, otherwise above.
  const dropTop = layout
    ? (layout.top + TOOLBAR_H + DROP_H <= layout.bounds.maxBottom
        ? layout.top + TOOLBAR_H + 2
        : layout.top - DROP_H - 2)
    : 0;

  return (
    <>
      {/* Coordinate-system probe — always rendered, never visible */}
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

          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={13} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={13} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={13} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Code size={13} /></Btn>

          <div className="w-px h-4 bg-neutral-700 self-center mx-0.5" />

          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>H1</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</Btn>
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
